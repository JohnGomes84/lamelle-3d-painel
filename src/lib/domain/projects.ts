import { z } from "zod";
import { money } from "./money";
import { priceProduct, type PricingSettings } from "./pricing";

export const PROJECT_STATUSES = ["Ideia", "Em desenvolvimento", "Aguardando impressão", "Em teste", "Aprovado", "À venda", "Entregue", "Pausado"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export const OPEN_PROJECT_STATUSES: readonly ProjectStatus[] = ["Ideia", "Em desenvolvimento", "Aguardando impressão", "Em teste", "Aprovado"];

const num = z.coerce.number().finite().nonnegative();

export const syncProductSchema = z.object({
  name: z.string().trim().min(1).max(160),
  occasion: z.string().trim().max(120).optional(),
  grams: num.default(0),
  print_minutes: num.default(0),
  work_minutes: num.default(0),
  supplies: num.default(0),
  packaging: num.default(0),
  target_price: num.optional(),
  multiplier: num.optional(),
  model_license: z.string().trim().max(120).optional(),
});

export const syncProjectSchema = z.object({
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9][a-z0-9._-]*$/),
  name: z.string().trim().min(1).max(160),
  line: z.string().trim().max(120).optional(),
  status: z.string().trim().max(60).optional(),
  status_text: z.string().trim().max(300).optional(),
  version: z.string().trim().max(40).optional(),
  summary: z.string().trim().max(1000).optional(),
  next_step: z.string().trim().max(500).optional(),
  client: z.string().trim().max(160).optional(),
  plates: z.array(z.object({ name: z.string().trim().max(160), minutes: num.default(0), grams: num.default(0), file: z.string().trim().max(260).optional() })).max(40).default([]),
  unit_cost: num.optional(),
  price: num.optional(),
  files: z.record(z.string(), z.number().int().nonnegative()).default({}),
  folder: z.string().trim().max(400).optional(),
  source_updated_at: z.string().datetime({ offset: true }).optional(),
  products: z.array(syncProductSchema).max(30).default([]),
});

export const syncPayloadSchema = z.object({ projects: z.array(syncProjectSchema).min(1).max(200) });
export type SyncProject = z.infer<typeof syncProjectSchema>;
export type SyncProduct = z.infer<typeof syncProductSchema>;

const strip = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Converte o status escrito no projeto (README/projeto.json) para um status do painel. */
export function normalizeStatus(status?: string, statusText?: string): ProjectStatus {
  const exact = PROJECT_STATUSES.find((s) => strip(s) === strip(status || ""));
  if (exact) return exact;
  const t = strip(`${status || ""} ${statusText || ""}`);
  if (/entregue/.test(t)) return "Entregue";
  if (/a venda|anunciad|vendendo/.test(t)) return "À venda";
  if (/pausad|parad/.test(t)) return "Pausado";
  if (/aguardando impress|pronta? para imprimir|fatiad/.test(t)) return "Aguardando impressão";
  if (/em teste|prototipo|aguardando teste|validac/.test(t)) return "Em teste";
  if (/aprovad/.test(t)) return "Aprovado";
  if (/ideia|rascunho/.test(t)) return "Ideia";
  return "Em desenvolvimento";
}

export function plateTotals(plates: SyncProject["plates"]) {
  return { print_minutes: money(plates.reduce((a, p) => a + p.minutes, 0)), grams: money(plates.reduce((a, p) => a + p.grams, 0)) };
}

/** Multiplicador que faz o preço do painel bater com o preço definido no projeto. */
export function productMultiplier(p: SyncProduct, settings: PricingSettings) {
  if (p.multiplier) return money(p.multiplier);
  const base = priceProduct({ grams: p.grams, printMinutes: p.print_minutes, workMinutes: p.work_minutes, supplies: p.supplies, packaging: p.packaging, multiplier: 1 }, settings);
  if (!p.target_price || !base.totalCost) return settings.defaultMultiplier || 3;
  return money(p.target_price / base.totalCost);
}

export const defaultPricingSettings: PricingSettings = { filamentKgPrice: 120, kwhRate: 0.95, printerValue: 2000, printerLifeHours: 2000, laborHour: 30, defaultMultiplier: 3 };
export function pricingSettingsFrom(raw: unknown): PricingSettings {
  const s = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const pick = (k: keyof PricingSettings) => (Number.isFinite(Number(s[k])) && Number(s[k]) > 0 ? Number(s[k]) : defaultPricingSettings[k]);
  return { filamentKgPrice: pick("filamentKgPrice"), kwhRate: pick("kwhRate"), printerValue: pick("printerValue"), printerLifeHours: pick("printerLifeHours"), laborHour: pick("laborHour"), defaultMultiplier: pick("defaultMultiplier") };
}

export function formatMinutes(min: number) {
  const m = Math.round(Number(min) || 0);
  return m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}` : `${m} min`;
}
