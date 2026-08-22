"use server";
import { revalidatePath } from "next/cache";
import { requireMembership } from "@/lib/auth/server";
import { calculateOrder, volumeDiscountRate } from "@/lib/domain/orders";
import { priceProduct } from "@/lib/domain/pricing";

export async function createOrder(formData: FormData) {
  const { membership, supabase } = await requireMembership();
  const productIds = formData.getAll("product_id").map(String);
  const quantities = formData.getAll("quantity").map(Number);
  const individualized = formData.getAll("individualized").map((value) => value === "true");
  if (!productIds.length) throw new Error("Adicione ao menos um item.");
  const { data: products, error } = await supabase.from("products").select("*").in("id", productIds).eq("organization_id", membership.organization_id);
  if (error || !products) throw new Error("Não foi possível carregar os produtos.");
  const { data: organization } = await supabase.from("organizations").select("settings").eq("id", membership.organization_id).single();
  const settings = (organization?.settings || {}) as Record<string, number>;
  const items = productIds.map((id, index) => {
    const product = products.find((candidate) => candidate.id === id);
    if (!product) throw new Error("Produto não encontrado.");
    const price = priceProduct(
      { grams: Number(product.grams), printMinutes: Number(product.print_minutes), workMinutes: Number(product.work_minutes), supplies: Number(product.supplies), packaging: Number(product.packaging), multiplier: Number(product.multiplier) },
      { filamentKgPrice: settings.filamentKgPrice || 120, kwhRate: settings.kwhRate || .95, printerValue: settings.printerValue || 2000, printerLifeHours: settings.printerLifeHours || 2000, laborHour: settings.laborHour || 30, defaultMultiplier: settings.defaultMultiplier || 3 },
    );
    const quantity = quantities[index] || 1;
    const isIndividualized = individualized[index] || false;
    const discountRate = volumeDiscountRate(quantity, isIndividualized);
    return { product_id: id, product_name: product.name, quantity, individualized: isIndividualized, unit_price: price.salePrice, unit_cost: price.totalCost, discount_rate: discountRate, total: quantity * price.salePrice * (1 - discountRate), cost: quantity * price.totalCost };
  });
  const totals = calculateOrder(items.map((item) => ({ quantity: item.quantity, unitPrice: item.unit_price, unitCost: item.unit_cost, individualized: item.individualized })));
  const eventDate = String(formData.get("event_date") || "");
  const deliveryDate = String(formData.get("delivery_date") || "");
  const { error: rpcError } = await supabase.rpc("create_order_with_items", { p_organization_id: membership.organization_id, p_code: `LAM-${Date.now().toString().slice(-7)}`, p_client_id: String(formData.get("client_id")), p_status: "Orçamento enviado", p_event_date: eventDate || null, p_delivery_date: deliveryDate || null, p_notes: String(formData.get("notes") || ""), p_totals: totals, p_items: items });
  if (rpcError) throw new Error("Não foi possível criar o pedido.");
  revalidatePath("/orders");
}

export async function recordPayment(orderId: string, formData: FormData) {
  const { membership, supabase } = await requireMembership();
  const { error } = await supabase.rpc("record_order_payment", { p_organization_id: membership.organization_id, p_order_id: orderId, p_date: String(formData.get("date")), p_amount: Number(formData.get("amount")), p_method: String(formData.get("method")) });
  if (error) throw new Error("Não foi possível registrar o pagamento.");
  revalidatePath("/orders"); revalidatePath("/finance");
}
