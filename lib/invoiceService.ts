import { supabase } from "@/lib/supabase";
import { Currency, CURRENCY_RATES } from "@/context/AppContext";

export type PaymentModel = "FULL" | "ADVANCE_50_50" | "MILESTONES";
export type InvoiceStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export interface Milestone {
  id: string;
  invoice_id: string;
  title: string;
  amount: number;
  status: "PENDING" | "PAID";
  order_index: number;
  created_at?: string;
}

export interface Invoice {
  id: string;
  project_id: string;
  invoice_number: string;
  client_id: string;
  currency: Currency;
  total_amount: number;
  paid_amount: number;
  payment_model: PaymentModel;
  status: InvoiceStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  milestones?: Milestone[];
}

export const PAYMENT_MODELS_INFO: Record<
  PaymentModel,
  {
    titleUa: string;
    titleEn: string;
    descUa: string;
    descEn: string;
    badge: string;
  }
> = {
  FULL: {
    titleUa: "100% Повна оплата",
    titleEn: "100% Full Payment",
    descUa: "Єдиний платіж перед стартом. Повне розблокування всіх матеріалів та рендерів.",
    descEn: "Single payment upfront. Unlocks all deliverables and high-res renders.",
    badge: "100%",
  },
  ADVANCE_50_50: {
    titleUa: "Аванс 50% / Залишок 50%",
    titleEn: "50% Advance / 50% Balance",
    descUa: "50% аванс для старту робіт, 50% залишок перед фінальним затвердженням та завантаженням HD.",
    descEn: "50% deposit to commence work, 50% balance before final HD release.",
    badge: "50 / 50",
  },
  MILESTONES: {
    titleUa: "Поетапна оплата (Milestones)",
    titleEn: "Milestones / Room-by-Room",
    descUa: "Оплата частинами за окремі приміщення чи зони. Рендери відкриваються по мірі сплати етапів.",
    descEn: "Step-by-step payment per zone or room. Deliverables unlock sequentially.",
    badge: "Етапи",
  },
};

/**
 * Calculates project budget estimate based on area and chosen currency
 */
export function calculateProjectCost(areaSqm: number, currency: Currency): number {
  // Base visualization price in UAH is 622 UAH/m² (~$15-$25/m²)
  const rateInUah = 622;
  const totalUah = Math.max(1, areaSqm) * rateInUah;

  if (currency === "UAH") return Math.round(totalUah);
  const conversionRate = CURRENCY_RATES[currency]?.rate || 0.024;
  return Math.round(totalUah * conversionRate);
}

/**
 * Generates default milestones based on area and rooms for MILESTONES payment model
 */
export function generateDefaultMilestones(totalAmount: number, lang: "UA" | "EN"): { title: string; amount: number; order_index: number }[] {
  const roundVal = (val: number) => Math.round(val);

  // 3 balanced milestone stages
  const stage1 = roundVal(totalAmount * 0.4);
  const stage2 = roundVal(totalAmount * 0.35);
  const stage3 = totalAmount - stage1 - stage2;

  if (lang === "UA") {
    return [
      { title: "Етап 1: Вітальня, Передпокій & Кухня", amount: stage1, order_index: 0 },
      { title: "Етап 2: Головна Спальня & Гардеробна", amount: stage2, order_index: 1 },
      { title: "Етап 3: Санвузли, Лоджія & Деталі", amount: stage3, order_index: 2 },
    ];
  }

  return [
    { title: "Milestone 1: Living Area, Entry & Kitchen", amount: stage1, order_index: 0 },
    { title: "Milestone 2: Master Bedroom & Walk-in Closet", amount: stage2, order_index: 1 },
    { title: "Milestone 3: Bathrooms, Balcony & Details", amount: stage3, order_index: 2 },
  ];
}

/**
 * Fetches or creates an invoice for a project
 */
export async function getOrCreateProjectInvoice(
  project: {
    id: string;
    client_id?: string;
    area: number;
    title: string;
    client_name?: string;
  },
  preferredCurrency: Currency = "USD",
  preferredModel: PaymentModel = "ADVANCE_50_50",
  lang: "UA" | "EN" = "UA"
): Promise<{ invoice: Invoice; milestones: Milestone[] }> {
  try {
    // 1. Try to find existing invoice in Supabase
    const { data: existingInvoice, error: fetchErr } = await supabase
      .from("invoices")
      .select("*, milestones(*)")
      .eq("project_id", project.id)
      .maybeSingle();

    if (existingInvoice && !fetchErr) {
      const milestones = (existingInvoice.milestones || []).sort(
        (a: Milestone, b: Milestone) => a.order_index - b.order_index
      );
      return {
        invoice: existingInvoice as Invoice,
        milestones,
      };
    }
  } catch (err) {
    console.warn("Could not query invoices table (may not exist yet):", err);
  }

  // 2. If not found or table not yet migrated, create or return fresh structured invoice
  const totalAmount = calculateProjectCost(project.area || 80, preferredCurrency);
  const invoiceNumber = `INV-2026-${project.id.slice(0, 6).toUpperCase()}`;

  const freshInvoice: Invoice = {
    id: crypto.randomUUID(),
    project_id: project.id,
    invoice_number: invoiceNumber,
    client_id: project.client_id || "00000000-0000-0000-0000-000000000000",
    currency: preferredCurrency,
    total_amount: totalAmount,
    paid_amount: 0,
    payment_model: preferredModel,
    status: "UNPAID",
    notes: `Рахунок за 3D-візуалізацію об'єкта "${project.title}" (${project.area} м²)`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const generatedMilestoneTemplates = generateDefaultMilestones(totalAmount, lang);
  const freshMilestones: Milestone[] = generatedMilestoneTemplates.map((m) => ({
    id: crypto.randomUUID(),
    invoice_id: freshInvoice.id,
    title: m.title,
    amount: m.amount,
    status: "PENDING",
    order_index: m.order_index,
    created_at: new Date().toISOString(),
  }));

  // Attempt to save to Supabase
  try {
    const { data: insertedInvoice, error: insErr } = await supabase
      .from("invoices")
      .insert({
        id: freshInvoice.id,
        project_id: freshInvoice.project_id,
        invoice_number: freshInvoice.invoice_number,
        client_id: freshInvoice.client_id,
        currency: freshInvoice.currency,
        total_amount: freshInvoice.total_amount,
        paid_amount: freshInvoice.paid_amount,
        payment_model: freshInvoice.payment_model,
        status: freshInvoice.status,
        notes: freshInvoice.notes,
      })
      .select()
      .single();

    if (!insErr && insertedInvoice) {
      // Also insert milestones if MILESTONES model
      if (preferredModel === "MILESTONES") {
        await supabase.from("milestones").insert(
          freshMilestones.map((m) => ({
            id: m.id,
            invoice_id: insertedInvoice.id,
            title: m.title,
            amount: m.amount,
            status: m.status,
            order_index: m.order_index,
          }))
        );
      }
      return {
        invoice: insertedInvoice as Invoice,
        milestones: freshMilestones,
      };
    }
  } catch (err) {
    console.warn("Could not persist invoice to database:", err);
  }

  return {
    invoice: freshInvoice,
    milestones: freshMilestones,
  };
}
