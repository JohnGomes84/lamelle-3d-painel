import { describe, expect, it } from "vitest";
import { priceProduct } from "./pricing";
import { defaultPricingSettings, formatMinutes, normalizeStatus, plateTotals, pricingSettingsFrom, productMultiplier, syncPayloadSchema } from "./projects";

describe("projetos sincronizados", () => {
  it("normaliza o status escrito no README", () => {
    expect(normalizeStatus(undefined, "v0.4 fatiada, aguardando impressão de teste")).toBe("Aguardando impressão");
    expect(normalizeStatus(undefined, "v1 STL gerado — protótipo, aguardando teste")).toBe("Em teste");
    expect(normalizeStatus(undefined, "aprovado (v1 impressa)")).toBe("Aprovado");
    expect(normalizeStatus("entregue")).toBe("Entregue");
    expect(normalizeStatus("À venda")).toBe("À venda");
    expect(normalizeStatus(undefined, "algo novo")).toBe("Em desenvolvimento");
  });

  it("soma tempo e filamento das placas", () => {
    expect(plateTotals([{ name: "P1", minutes: 157, grams: 61 }, { name: "P2", minutes: 100, grams: 53.2 }])).toEqual({ print_minutes: 257, grams: 114.2 });
    expect(formatMinutes(257)).toBe("4h17");
    expect(formatMinutes(48)).toBe("48 min");
  });

  it("calcula o multiplicador que reproduz o preço do projeto no painel", () => {
    const prod = { name: "Kit", grams: 114.2, print_minutes: 257, work_minutes: 10, supplies: 2, packaging: 1, target_price: 89 };
    const m = productMultiplier(prod, defaultPricingSettings);
    const price = priceProduct({ grams: 114.2, printMinutes: 257, workMinutes: 10, supplies: 2, packaging: 1, multiplier: m }, defaultPricingSettings).salePrice;
    expect(Math.abs(price - 89)).toBeLessThan(0.5);
    expect(productMultiplier({ ...prod, multiplier: 3.2 }, defaultPricingSettings)).toBe(3.2);
  });

  it("usa os parâmetros da organização e cai no padrão quando faltam", () => {
    expect(pricingSettingsFrom({ laborHour: 25, kwhRate: "x" })).toMatchObject({ laborHour: 25, kwhRate: 0.95 });
  });

  it("valida o pacote enviado pelo PC", () => {
    expect(syncPayloadSchema.safeParse({ projects: [{ slug: "aplicador-pro-dtf-uv", name: "Aplicador" }] }).success).toBe(true);
    expect(syncPayloadSchema.safeParse({ projects: [{ slug: "Com Espaço", name: "x" }] }).success).toBe(false);
    expect(syncPayloadSchema.safeParse({ projects: [] }).success).toBe(false);
  });
});
