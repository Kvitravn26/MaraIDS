"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp, Currency } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import {
  Invoice,
  Milestone,
  PaymentModel,
  getOrCreateProjectInvoice,
  PAYMENT_MODELS_INFO,
} from "@/lib/invoiceService";
import PaymentCheckoutModal from "@/components/PaymentCheckoutModal";

export default function ProjectInvoicePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-4xl px-5 pb-20 pt-32 font-mono text-xs text-[#8f8c82]">
          Loading invoice...
        </main>
      }
    >
      <ProjectInvoiceContent />
    </Suspense>
  );
}

function ProjectInvoiceContent() {
  const params = useParams();
  const projectId = (params?.projectId || params?.id) as string;
  const router = useRouter();
  const { lang, currency: currentCurrency } = useApp();

  const [project, setProject] = useState<any>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Modal checkout state
  const [checkoutModal, setCheckoutModal] = useState<{
    isOpen: boolean;
    stage?: "advance" | "balance" | "full" | "milestone";
    amount: number;
    milestoneId?: string;
    milestoneTitle?: string;
  }>({
    isOpen: false,
    amount: 0,
  });

  const invoiceRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // Fetch project
      const { data: projData, error: projErr } = await supabase
        .from("client_project_requests")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projErr || !projData) {
        throw new Error(lang === "UA" ? "Проєкт не знайдено." : "Project not found.");
      }

      setProject(projData);

      // Load or create invoice
      const invoiceData = await getOrCreateProjectInvoice(
        projData,
        currentCurrency,
        "ADVANCE_50_50",
        lang
      );

      setInvoice(invoiceData.invoice);
      setMilestones(invoiceData.milestones);
    } catch (err: any) {
      console.error("Error loading invoice:", err);
      setError(err?.message || (lang === "UA" ? "Помилка завантаження рахунку" : "Error loading invoice"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId, lang]);

  // Payment model changer (allowed when unpaid)
  const handleChangePaymentModel = async (newModel: PaymentModel) => {
    if (!invoice || invoice.status === "PAID") return;

    try {
      setInvoice((prev) => (prev ? { ...prev, payment_model: newModel } : null));

      // Attempt to update in Supabase
      await supabase
        .from("invoices")
        .update({ payment_model: newModel })
        .eq("id", invoice.id);

      // If switching to MILESTONES, ensure milestones exist in state
      if (newModel === "MILESTONES" && milestones.length === 0) {
        const refreshed = await getOrCreateProjectInvoice(project, invoice.currency, newModel, lang);
        setMilestones(refreshed.milestones);
      }
    } catch (err) {
      console.error("Could not update payment model:", err);
    }
  };

  // PDF Export using jspdf + html2canvas
  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;
    setIsExportingPdf(true);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${invoice?.invoice_number || "Mara"}.pdf`);
    } catch (pdfErr) {
      console.warn("Direct PDF render failed, falling back to window.print():", pdfErr);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyIban = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(lang === "UA" ? "✓ Реквізити скопійовано!" : "✓ Requisites copied!");
    setTimeout(() => setCopyFeedback(""), 3000);
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-5 pb-20 pt-32 font-mono text-xs text-[#8f8c82]">
        {lang === "UA" ? "Формування рахунку-фактури..." : "Generating invoice..."}
      </main>
    );
  }

  if (!project || !invoice) {
    return (
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-32 text-[#1c1b18]">
        <p className="rounded-sm border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          {error || (lang === "UA" ? "Рахунок не знайдено." : "Invoice unavailable.")}
        </p>
        <Link
          href="/client"
          className="mt-5 inline-block text-xs font-mono text-[#1c1b18] underline"
        >
          {lang === "UA" ? "← Повернутися до кабінету" : "← Back to portal"}
        </Link>
      </main>
    );
  }

  // Financial calculations
  const totalAmount = invoice.total_amount;
  const paidAmount = invoice.paid_amount;
  const remainingAmount = Math.max(0, totalAmount - paidAmount);
  const paidPercentage = Math.min(100, Math.round((paidAmount / totalAmount) * 100));

  // Visual progress bar representation (e.g. [████████░░] 50%)
  const filledBlocks = Math.round((paidPercentage / 100) * 12);
  const emptyBlocks = 12 - filledBlocks;
  const asciiProgressBar = `[${"█".repeat(filledBlocks)}${"░".repeat(emptyBlocks)}]`;

  const invoiceCurrency = invoice.currency || currentCurrency;
  const pricePerSqm = Math.round(totalAmount / (project.area || 1));

  // Date strings
  const invoiceDate = new Date(invoice.created_at).toLocaleDateString(
    lang === "UA" ? "uk-UA" : "en-US",
    { day: "2-digit", month: "long", year: "numeric" }
  );
  const dueDate = new Date(
    new Date(invoice.created_at).getTime() + 7 * 24 * 60 * 60 * 1000
  ).toLocaleDateString(lang === "UA" ? "uk-UA" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-5xl px-5 pb-24 pt-32 text-[#1c1b18] space-y-8 sm:px-8">
      {/* Top Controls Bar (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden border-b border-[#e4e0d5] pb-4">
        <Link
          href={`/project-workspace/${project.id}`}
          className="inline-flex items-center gap-1.5 font-mono text-xs text-[#8f8c82] hover:text-[#1c1b18]"
        >
          ← {lang === "UA" ? "Робоча зона проєкту" : "Project Workspace"}
        </Link>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="cursor-pointer rounded-xs border border-[#e4e0d5] bg-white px-3.5 py-2 text-[#1c1b18] hover:border-[#1c1b18] transition-colors inline-flex items-center gap-1.5"
          >
            <span>{isExportingPdf ? "⏳" : "📥"}</span>
            <span>{isExportingPdf ? (lang === "UA" ? "Створення PDF..." : "Exporting...") : (lang === "UA" ? "Завантажити PDF" : "Download PDF")}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="cursor-pointer rounded-xs border border-[#e4e0d5] bg-white px-3.5 py-2 text-[#1c1b18] hover:border-[#1c1b18] transition-colors inline-flex items-center gap-1.5"
          >
            <span>🖨️</span>
            <span>{lang === "UA" ? "Друк" : "Print"}</span>
          </button>

          {remainingAmount > 0 && (
            <button
              type="button"
              onClick={() => {
                if (invoice.payment_model === "ADVANCE_50_50") {
                  if (paidAmount === 0) {
                    setCheckoutModal({
                      isOpen: true,
                      stage: "advance",
                      amount: Math.round(totalAmount * 0.5),
                    });
                  } else {
                    setCheckoutModal({
                      isOpen: true,
                      stage: "balance",
                      amount: remainingAmount,
                    });
                  }
                } else {
                  setCheckoutModal({
                    isOpen: true,
                    stage: "full",
                    amount: remainingAmount,
                  });
                }
              }}
              className="cursor-pointer rounded-xs bg-[#1c1b18] px-5 py-2 font-medium uppercase tracking-wider text-white hover:bg-[#33312c] transition-colors inline-flex items-center gap-1.5"
            >
              <span>💳</span>
              <span>{lang === "UA" ? "Сплатити онлайн" : "Pay Online"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Model Selection Tabs (Editable before 100% paid) */}
      <div className="rounded-sm border border-[#e4e0d5] bg-white p-5 print:hidden shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e4e0d5] pb-3 mb-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8f8c82]">
              {lang === "UA" ? "Вибір моделі розрахунку" : "Payment Model Selector"}
            </span>
            <h4 className="font-serif text-lg font-normal text-[#1c1b18]">
              {lang === "UA" ? "Оберіть зручний графік оплати" : "Choose Payment Schedule"}
            </h4>
          </div>
          {invoice.status === "PAID" ? (
            <span className="rounded-xs bg-emerald-100 px-2.5 py-1 font-mono text-xs font-semibold text-emerald-800">
              ✓ {lang === "UA" ? "Рахунок сплачено" : "Invoice Settled"}
            </span>
          ) : (
            <span className="font-mono text-[11px] text-[#6e6c64]">
              {lang === "UA" ? "Модель можна змінити до повної оплати" : "Flexible before full payment"}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(["FULL", "ADVANCE_50_50", "MILESTONES"] as PaymentModel[]).map((mKey) => {
            const info = PAYMENT_MODELS_INFO[mKey];
            const isSelected = invoice.payment_model === mKey;
            return (
              <button
                key={mKey}
                type="button"
                onClick={() => handleChangePaymentModel(mKey)}
                disabled={invoice.status === "PAID"}
                className={`cursor-pointer rounded-xs border p-3.5 text-left transition-all ${
                  isSelected
                    ? "border-[#1c1b18] bg-[#faf8f5] ring-1 ring-[#1c1b18]"
                    : "border-[#e4e0d5] bg-white hover:border-[#1c1b18]/60"
                } disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-semibold text-[#1c1b18]">
                    {lang === "UA" ? info.titleUa : info.titleEn}
                  </span>
                  <span className="rounded-xs bg-[#f4f0e8] px-1.5 py-0.5 text-[10px] text-[#4a4943]">
                    {info.badge}
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-[#6e6c64]">
                  {lang === "UA" ? info.descUa : info.descEn}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress & Live Settlement Bar */}
      <div className="rounded-sm border border-[#e4e0d5] bg-[#faf8f5] p-5 shadow-xs font-mono text-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1c1b18]">
              {lang === "UA" ? "Прогрес розрахунку:" : "Settlement Progress:"}
            </span>
            <span className="font-bold text-[#1c1b18]">{paidPercentage}%</span>
            <span className="text-[#8f8c82] hidden sm:inline">{asciiProgressBar}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[#6e6c64]">
              {lang === "UA" ? "Сплачено:" : "Paid:"}{" "}
              <strong className="text-emerald-700 font-semibold">{paidAmount.toLocaleString()} {invoiceCurrency}</strong>
            </span>
            <span className="text-[#8f8c82]">/</span>
            <span className="text-[#6e6c64]">
              {lang === "UA" ? "Загалом:" : "Total:"}{" "}
              <strong className="text-[#1c1b18] font-semibold">{totalAmount.toLocaleString()} {invoiceCurrency}</strong>
            </span>
          </div>
        </div>

        {/* Visual Progress Line */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#e4e0d5]">
          <div
            className="h-full bg-[#1c1b18] transition-all duration-500"
            style={{ width: `${paidPercentage}%` }}
          />
        </div>
      </div>

      {/* =========================================================================
          THE BRANDED INVOICE PAPER (Target for PDF generation and printing)
          ========================================================================= */}
      <div
        ref={invoiceRef}
        id="invoice-paper"
        className="rounded-sm border border-[#e4e0d5] bg-white p-8 sm:p-12 shadow-sm space-y-8"
      >
        {/* Studio Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-[#e4e0d5] pb-8">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl sm:text-4xl tracking-tight text-[#1c1b18] font-normal">
                MARA
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#8f8c82]">
                Design Studio
              </span>
            </div>
            <p className="mt-1 text-xs text-[#6e6c64] font-mono">
              3D Architectural Visualization & Spatial Concepts
            </p>
            <div className="mt-3 text-[11px] font-mono leading-relaxed text-[#8f8c82]">
              <p>м. Київ, вул. Архітектора Городецького, 11</p>
              <p>Email: finance@mara-design.com · Тел: +380 (44) 239-11-20</p>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono text-xs space-y-1.5">
            <span className="inline-block rounded-xs bg-[#1c1b18] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              {lang === "UA" ? "РАХУНОК-ФАКТУРА" : "INVOICE"}
            </span>
            <div className="text-base font-bold text-[#1c1b18] pt-1">
              {invoice.invoice_number}
            </div>
            <div className="text-[#6e6c64]">
              {lang === "UA" ? "Дата:" : "Date:"} {invoiceDate}
            </div>
            <div className="text-[#6e6c64]">
              {lang === "UA" ? "Термін оплати:" : "Due Date:"} {dueDate}
            </div>
            <div>
              <span
                className={`inline-block rounded-xs px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  invoice.status === "PAID"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : invoice.status === "PARTIALLY_PAID"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {invoice.status === "PAID"
                  ? (lang === "UA" ? "СПЛАЧЕНО" : "PAID")
                  : invoice.status === "PARTIALLY_PAID"
                  ? (lang === "UA" ? "ЧАСТКОВО СПЛАЧЕНО" : "PARTIALLY PAID")
                  : (lang === "UA" ? "ОЧІКУЄ ОПЛАТИ" : "UNPAID")}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Project Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 rounded-xs border border-[#e4e0d5] bg-[#faf8f5] p-5 font-mono text-xs">
          <div>
            <span className="text-[10px] uppercase font-semibold text-[#8f8c82] tracking-wider block mb-1">
              {lang === "UA" ? "Платник / Замовник (Client):" : "Billed To (Client):"}
            </span>
            <p className="font-bold text-[#1c1b18] text-sm">{project.client_name}</p>
            <p className="text-[#6e6c64] mt-0.5">{project.client_email}</p>
            <p className="text-[#8f8c82] mt-1 text-[11px]">
              ID замовника: {project.client_id.slice(0, 8)}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-[#8f8c82] tracking-wider block mb-1">
              {lang === "UA" ? "Об'єкт візуалізації (Project):" : "Project Particulars:"}
            </span>
            <p className="font-bold text-[#1c1b18] text-sm">{project.title}</p>
            <p className="text-[#6e6c64] mt-0.5">
              {project.property_type === "apartment"
                ? (lang === "UA" ? "Квартира" : "Apartment")
                : project.property_type === "commercial"
                ? (lang === "UA" ? "Комерційне приміщення" : "Commercial space")
                : (lang === "UA" ? "Будинок" : "House")}
              {` · ${project.area} м²`}
            </p>
            <p className="text-[#8f8c82] mt-1 text-[11px]">
              {lang === "UA" ? "Модель розрахунку:" : "Payment Model:"}{" "}
              <span className="font-semibold text-[#1c1b18]">
                {PAYMENT_MODELS_INFO[invoice.payment_model][lang === "UA" ? "titleUa" : "titleEn"]}
              </span>
            </p>
          </div>
        </div>

        {/* Services Table */}
        <div className="overflow-hidden rounded-xs border border-[#e4e0d5]">
          <table className="w-full text-left font-mono text-xs">
            <thead className="border-b border-[#e4e0d5] bg-[#faf8f5] text-[#6e6c64] text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-3.5 w-12 text-center">№</th>
                <th className="p-3.5">{lang === "UA" ? "Опис послуги" : "Service Description"}</th>
                <th className="p-3.5 text-center">{lang === "UA" ? "Об'єм" : "Area"}</th>
                <th className="p-3.5 text-right">{lang === "UA" ? "Ціна за м²" : "Rate / m²"}</th>
                <th className="p-3.5 text-right">{lang === "UA" ? "Сума" : "Amount"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e0d5]">
              <tr>
                <td className="p-3.5 text-center text-[#8f8c82]">1</td>
                <td className="p-3.5">
                  <div className="font-semibold text-[#1c1b18]">
                    {lang === "UA" ? "3D-візуалізація інтер'єру простору" : "3D Architectural Visualization"}
                  </div>
                  <div className="text-[11px] text-[#6e6c64] mt-0.5">
                    {lang === "UA"
                      ? `Фотореалістичні ракурси, освітлення, моделювання меблів та текстурування (${project.title})`
                      : `Photorealistic camera angles, textures, lighting & CGI modeling (${project.title})`}
                  </div>
                </td>
                <td className="p-3.5 text-center text-[#1c1b18]">{project.area} м²</td>
                <td className="p-3.5 text-right text-[#1c1b18]">{pricePerSqm} {invoiceCurrency}</td>
                <td className="p-3.5 text-right font-semibold text-[#1c1b18]">
                  {totalAmount.toLocaleString()} {invoiceCurrency}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals & Breakdown */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 font-mono text-xs">
          <div className="max-w-md text-[#6e6c64] space-y-2">
            <span className="text-[10px] uppercase font-semibold text-[#8f8c82] tracking-wider block">
              {lang === "UA" ? "Правила та умови оплати:" : "Payment Terms & Deliverables:"}
            </span>
            {invoice.payment_model === "FULL" && (
              <p className="text-[11px] leading-relaxed">
                {lang === "UA"
                  ? "• 100% попередня оплата. Повне розблокування всіх ракурсів, версій рендерів та експортних креслень без обмежень."
                  : "• 100% upfront payment. Immediate unblocking of all render versions, drafts, and exportable blueprints."}
              </p>
            )}
            {invoice.payment_model === "ADVANCE_50_50" && (
              <div className="text-[11px] leading-relaxed space-y-1">
                <p>
                  {lang === "UA"
                    ? "• Аванс 50%: обов'язковий для старту моделювання 3D-сцени та геометрії приміщення."
                    : "• 50% Advance: required to commence geometry modeling & preliminary scene setup."}
                </p>
                <p>
                  {lang === "UA"
                    ? "• Залишок 50%: вноситься перед фінальним затвердженням. До повної оплати прев'ю захищені водяним знаком."
                    : "• 50% Balance: due before final handover. Drafts carry watermarks until settled."}
                </p>
              </div>
            )}
            {invoice.payment_model === "MILESTONES" && (
              <p className="text-[11px] leading-relaxed">
                {lang === "UA"
                  ? "• Поетапна оплата: фінальні HD-рендери та креслення розблоковуються почергово для кожної оплаченої зони."
                  : "• Milestones: full HD renders unlock sequentially as each respective room milestone is paid."}
              </p>
            )}
          </div>

          <div className="w-full sm:w-72 rounded-xs border border-[#e4e0d5] bg-[#faf8f5] p-4 space-y-2">
            <div className="flex justify-between items-center text-[#6e6c64]">
              <span>{lang === "UA" ? "Разом без ПДВ:" : "Subtotal:"}</span>
              <span>{totalAmount.toLocaleString()} {invoiceCurrency}</span>
            </div>
            <div className="flex justify-between items-center text-[#6e6c64]">
              <span>{lang === "UA" ? "ПДВ (0% спрощена):" : "Tax (0%):"}</span>
              <span>0 {invoiceCurrency}</span>
            </div>
            <div className="border-t border-[#e4e0d5] pt-2 flex justify-between items-center text-sm font-bold text-[#1c1b18]">
              <span>{lang === "UA" ? "Загальна сума:" : "Total:"}</span>
              <span>{totalAmount.toLocaleString()} {invoiceCurrency}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-emerald-700 font-semibold pt-1">
              <span>{lang === "UA" ? "Сплачено:" : "Paid:"}</span>
              <span>{paidAmount.toLocaleString()} {invoiceCurrency}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-[#1c1b18] font-semibold border-t border-[#e4e0d5] pt-1">
              <span>{lang === "UA" ? "До сплати:" : "Balance Due:"}</span>
              <span>{remainingAmount.toLocaleString()} {invoiceCurrency}</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            STAGE / MILESTONES PAYMENT ACTION CARDS
            ========================================================================= */}
        <div className="border-t border-[#e4e0d5] pt-6 space-y-4">
          <h4 className="font-mono text-xs uppercase tracking-[0.16em] text-[#1c1b18] font-semibold">
            {lang === "UA" ? "Графік платежів та статус етапів" : "Payment Schedule & Stages"}
          </h4>

          {/* MODEL A: FULL */}
          {invoice.payment_model === "FULL" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xs border border-[#e4e0d5] bg-[#faf8f5] p-4 font-mono text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1c1b18]">
                    {lang === "UA" ? "100% Повна оплата проєкту" : "100% Full Project Payment"}
                  </span>
                  <span
                    className={`rounded-xs px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      invoice.status === "PAID"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-50 text-red-800"
                    }`}
                  >
                    {invoice.status === "PAID" ? (lang === "UA" ? "Сплачено" : "Paid") : (lang === "UA" ? "Очікує оплати" : "Pending")}
                  </span>
                </div>
                <p className="text-[11px] text-[#6e6c64] mt-1">
                  {totalAmount.toLocaleString()} {invoiceCurrency} · {lang === "UA" ? "Повний розрахунок" : "Turnkey settlement"}
                </p>
              </div>

              {invoice.status !== "PAID" && (
                <button
                  type="button"
                  onClick={() =>
                    setCheckoutModal({
                      isOpen: true,
                      stage: "full",
                      amount: totalAmount,
                    })
                  }
                  className="print:hidden cursor-pointer rounded-xs bg-[#1c1b18] px-4 py-2 font-medium uppercase tracking-wider text-white hover:bg-[#33312c] transition-colors"
                >
                  {lang === "UA" ? "Сплатити 100% онлайн →" : "Pay 100% Online →"}
                </button>
              )}
            </div>
          )}

          {/* MODEL B: ADVANCE 50 / 50 */}
          {invoice.payment_model === "ADVANCE_50_50" && (
            <div className="space-y-3 font-mono text-xs">
              {/* Stage 1: Advance */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xs border border-[#e4e0d5] bg-[#faf8f5] p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1c1b18]">
                      {lang === "UA" ? "1. Аванс (50%) — Старт моделювання" : "1. Advance (50%) — Project Kickoff"}
                    </span>
                    <span
                      className={`rounded-xs px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        paidAmount >= Math.round(totalAmount * 0.5)
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-50 text-red-800"
                      }`}
                    >
                      {paidAmount >= Math.round(totalAmount * 0.5) ? (lang === "UA" ? "Сплачено ✓" : "Paid ✓") : (lang === "UA" ? "Очікує оплати" : "Unpaid")}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6e6c64] mt-1">
                    {Math.round(totalAmount * 0.5).toLocaleString()} {invoiceCurrency} · {lang === "UA" ? "Необхідно для запуску робіт дизайнера" : "Unblocks designer start"}
                  </p>
                </div>

                {paidAmount < Math.round(totalAmount * 0.5) && (
                  <button
                    type="button"
                    onClick={() =>
                      setCheckoutModal({
                        isOpen: true,
                        stage: "advance",
                        amount: Math.round(totalAmount * 0.5),
                      })
                    }
                    className="print:hidden cursor-pointer rounded-xs bg-[#1c1b18] px-4 py-2 font-medium uppercase tracking-wider text-white hover:bg-[#33312c] transition-colors"
                  >
                    {lang === "UA" ? "Сплатити аванс 50% →" : "Pay 50% Deposit →"}
                  </button>
                )}
              </div>

              {/* Stage 2: Balance */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xs border border-[#e4e0d5] bg-[#faf8f5] p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1c1b18]">
                      {lang === "UA" ? "2. Залишок (50%) — Фінальні HD-рендери" : "2. Balance (50%) — Final HD Delivery"}
                    </span>
                    <span
                      className={`rounded-xs px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        paidAmount >= totalAmount
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {paidAmount >= totalAmount ? (lang === "UA" ? "Сплачено ✓" : "Paid ✓") : (lang === "UA" ? "До оплати" : "Pending")}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6e6c64] mt-1">
                    {Math.round(totalAmount * 0.5).toLocaleString()} {invoiceCurrency} · {lang === "UA" ? "Знімає водяні знаки та відкриває фінальний експорт" : "Unlocks watermark-free HD downloads"}
                  </p>
                </div>

                {paidAmount < totalAmount && (
                  <button
                    type="button"
                    disabled={paidAmount < Math.round(totalAmount * 0.5)}
                    onClick={() =>
                      setCheckoutModal({
                        isOpen: true,
                        stage: "balance",
                        amount: totalAmount - paidAmount,
                      })
                    }
                    className="print:hidden cursor-pointer rounded-xs bg-[#1c1b18] px-4 py-2 font-medium uppercase tracking-wider text-white hover:bg-[#33312c] transition-colors disabled:opacity-40"
                  >
                    {lang === "UA" ? "Сплатити залишок 50% →" : "Pay 50% Balance →"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MODEL C: MILESTONES */}
          {invoice.payment_model === "MILESTONES" && (
            <div className="space-y-3 font-mono text-xs">
              {milestones.length === 0 ? (
                <p className="text-xs text-[#8f8c82]">
                  {lang === "UA" ? "Етапи формуються..." : "Milestones are loading..."}
                </p>
              ) : (
                milestones.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xs border border-[#e4e0d5] bg-[#faf8f5] p-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1c1b18]">{m.title}</span>
                        <span
                          className={`rounded-xs px-2 py-0.5 text-[10px] font-semibold uppercase ${
                            m.status === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-50 text-red-800"
                          }`}
                        >
                          {m.status === "PAID" ? (lang === "UA" ? "Сплачено ✓" : "Paid ✓") : (lang === "UA" ? "Очікує" : "Unpaid")}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6e6c64] mt-1">
                        {Number(m.amount).toLocaleString()} {invoiceCurrency} · {m.status === "PAID" ? (lang === "UA" ? "Рендери цієї зони розблоковані" : "Zone renders unlocked") : (lang === "UA" ? "Розблоковує рендери кімнати" : "Unlocks room deliverables")}
                      </p>
                    </div>

                    {m.status !== "PAID" && (
                      <button
                        type="button"
                        onClick={() =>
                          setCheckoutModal({
                            isOpen: true,
                            stage: "milestone",
                            milestoneId: m.id,
                            milestoneTitle: m.title,
                            amount: Number(m.amount),
                          })
                        }
                        className="print:hidden cursor-pointer rounded-xs bg-[#1c1b18] px-4 py-2 font-medium uppercase tracking-wider text-white hover:bg-[#33312c] transition-colors"
                      >
                        {lang === "UA" ? `Сплатити етап (${Number(m.amount).toLocaleString()} ${invoiceCurrency}) →` : `Pay Milestone →`}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Banking Requisites Box for Direct Wire Transfer */}
        <div className="rounded-xs border border-[#e4e0d5] bg-[#faf8f5] p-5 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-[#8f8c82] tracking-wider">
              {lang === "UA" ? "Банківські реквізити для оплати за IBAN (ФОП):" : "Official Wire Transfer Details (IBAN):"}
            </span>
            {copyFeedback && (
              <span className="text-emerald-700 font-bold text-[11px]">{copyFeedback}</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-[#4a4943]">
            <div>
              <p><strong>Одержувач:</strong> ФОП Mara Design Studio</p>
              <p><strong>ЄДРПОУ / ІПН:</strong> 3419827361</p>
              <p><strong>Банк:</strong> АТ "Універсал Банк" (Monobank)</p>
            </div>
            <div>
              <p className="flex items-center gap-2">
                <span><strong>IBAN:</strong> UA483052990000026007812903145</span>
                <button
                  type="button"
                  onClick={() => handleCopyIban("UA483052990000026007812903145")}
                  className="print:hidden cursor-pointer text-[#1c1b18] underline hover:no-underline text-[10px]"
                >
                  [Копіювати]
                </button>
              </p>
              <p><strong>Призначення:</strong> Оплата за послуги 3D-візуалізації згідно з рахунком {invoice.invoice_number}</p>
            </div>
          </div>
        </div>

        {/* Stamp & Signature Footer */}
        <div className="flex justify-between items-end pt-8 border-t border-[#e4e0d5] font-mono text-xs text-[#6e6c64]">
          <div>
            <p className="font-semibold text-[#1c1b18]">Mara Design Studio</p>
            <p className="text-[10px] text-[#8f8c82] mt-0.5">Керівник студії / Арт-директор</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="font-serif italic text-base text-[#1c1b18]">Mara D.S.</span>
              <span className="rounded-full border border-[#8f8c82] px-2 py-0.5 text-[8px] uppercase tracking-widest text-[#8f8c82]">
                SEAL OF APPROVAL
              </span>
            </div>
          </div>

          <div className="text-right text-[10px] text-[#8f8c82]">
            <p>Дякуємо за співпрацю!</p>
            <p>Thank you for choosing Mara Studio.</p>
          </div>
        </div>
      </div>

      {/* Online Payment Checkout Modal */}
      <PaymentCheckoutModal
        isOpen={checkoutModal.isOpen}
        onClose={() => setCheckoutModal({ isOpen: false, amount: 0 })}
        onSuccess={() => {
          setCheckoutModal({ isOpen: false, amount: 0 });
          loadData();
        }}
        invoiceId={invoice.id}
        projectId={project.id}
        projectTitle={project.title}
        invoiceNumber={invoice.invoice_number}
        amount={checkoutModal.amount}
        currency={invoiceCurrency}
        stage={checkoutModal.stage}
        milestoneId={checkoutModal.milestoneId}
        milestoneTitle={checkoutModal.milestoneTitle}
        paymentModel={invoice.payment_model}
      />
    </main>
  );
}
