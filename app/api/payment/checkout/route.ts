import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const recipientDetails = body.recipientDetails;
    const requiredRecipientFields = ["name", "country", "address", "email", "city", "phone"];
    const hasRequiredRecipientDetails = requiredRecipientFields.every(
      (field) => typeof recipientDetails?.[field] === "string" && recipientDetails[field].trim().length > 0
    );
    const hasValidEmail =
      typeof recipientDetails?.email === "string" &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientDetails.email.trim());

    if (!hasRequiredRecipientDetails || !hasValidEmail) {
      return NextResponse.json(
        { success: false, error: "Complete all required invoice recipient details before payment." },
        { status: 400 }
      );
    }

    const {
      invoiceId,
      projectId,
      milestoneId,
      stage,
      amount,
      currency = "USD",
      paymentMethod = "card",
      paymentModel = "FULL",
      projectTitle = "Об'єкт",
      invoiceNumber = "INV-001",
    } = body;

    if (!invoiceId && !projectId) {
      return NextResponse.json(
        { success: false, error: "Missing invoiceId or projectId" },
        { status: 400 }
      );
    }

    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    // 1. Fetch current invoice if available
    let currentInvoice: any = null;
    if (invoiceId) {
      const { data } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .maybeSingle();
      currentInvoice = data;
    } else if (projectId) {
      const { data } = await supabase
        .from("invoices")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();
      currentInvoice = data;
    }

    let updatedPaidAmount = Number(amount || 0);
    let newInvoiceStatus = "PAID";
    let updatedProjectStatus = "IN_PROGRESS";

    if (currentInvoice) {
      const total = Number(currentInvoice.total_amount || amount);
      const prevPaid = Number(currentInvoice.paid_amount || 0);

      if (milestoneId) {
        // Milestone payment
        await supabase
          .from("milestones")
          .update({ status: "PAID" })
          .eq("id", milestoneId);

        // Fetch all milestones for this invoice
        const { data: allMilestones } = await supabase
          .from("milestones")
          .select("id, amount, status")
          .eq("invoice_id", currentInvoice.id);

        const paidSum = (allMilestones || []).reduce((acc: number, m: any) => {
          return m.status === "PAID" ? acc + Number(m.amount) : acc;
        }, 0);

        updatedPaidAmount = paidSum;
        newInvoiceStatus = paidSum >= total ? "PAID" : "PARTIALLY_PAID";
      } else if (stage === "advance") {
        updatedPaidAmount = Math.min(total, prevPaid + Number(amount));
        newInvoiceStatus = updatedPaidAmount >= total ? "PAID" : "PARTIALLY_PAID";
        updatedProjectStatus = "IN_PROGRESS";
      } else if (stage === "balance") {
        updatedPaidAmount = total;
        newInvoiceStatus = "PAID";
      } else {
        // FULL payment
        updatedPaidAmount = total;
        newInvoiceStatus = "PAID";
      }

      // Update invoice in Supabase
      await supabase
        .from("invoices")
        .update({
          paid_amount: updatedPaidAmount,
          status: newInvoiceStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentInvoice.id);
    }

    // 2. If advance payment or full payment for pending project, set project status to IN_PROGRESS
    if (projectId) {
      if (stage === "advance" || stage === "full" || newInvoiceStatus === "PAID") {
        await supabase
          .from("client_project_requests")
          .update({ status: "IN_PROGRESS" })
          .eq("id", projectId)
          .in("status", ["PENDING_APPROVAL", "AWAITING_DESIGNER", "AWAITING_PAYMENT"]);
      }

      // Add a system notification in project discussion
      try {
        const paymentStageText =
          stage === "advance"
            ? "Аванс 50%"
            : stage === "balance"
            ? "Залишок 50%"
            : milestoneId
            ? "Окремий етап (Milestone)"
            : "100% Повна оплата";

        await supabase.from("client_project_messages").insert({
          project_id: projectId,
          sender_id: currentInvoice?.client_id || "00000000-0000-0000-0000-000000000000",
          body: `💳 Отримано онлайн-оплату: ${amount} ${currency} (${paymentStageText}). Транзакція: ${transactionId}. Статус рахунку оновлено.`,
          attachments: [],
        });
      } catch (chatErr) {
        console.warn("Could not post payment notification to chat:", chatErr);
      }
    }

    // 3. Send Telegram notification as specified in prompt
    try {
      const modelLabel =
        paymentModel === "ADVANCE_50_50"
          ? "Аванс 50/50"
          : paymentModel === "MILESTONES"
          ? "Поетапна (Milestones)"
          : "100% Повна оплата";

      const host = request.headers.get("host") || "localhost:3000";
      const protocol = host.includes("localhost") ? "http" : "https";

      await fetch(`${protocol}://${host}/api/telegram`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payment",
          projectTitle,
          amount,
          currency,
          paymentModel: modelLabel,
          invoiceNumber,
        }),
      });
    } catch (tgErr) {
      console.warn("Could not dispatch telegram notification:", tgErr);
    }

    return NextResponse.json({
      success: true,
      transactionId,
      paidAmount: updatedPaidAmount,
      invoiceStatus: newInvoiceStatus,
      paymentMethod,
      message: "Оплата успішно оброблена (Monobank/LiqPay/Stripe Simulator)",
    });
  } catch (error: any) {
    console.error("Error in /api/payment/checkout:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
