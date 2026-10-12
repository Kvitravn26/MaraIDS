"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoiceId: string;
  projectId: string;
  projectTitle: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  stage?: "advance" | "balance" | "full" | "milestone";
  milestoneId?: string;
  milestoneTitle?: string;
  paymentModel: string;
}

export default function PaymentCheckoutModal({
  isOpen,
  onClose,
  onSuccess,
  invoiceId,
  projectId,
  projectTitle,
  invoiceNumber,
  amount,
  currency,
  stage = "full",
  milestoneId,
  milestoneTitle,
  paymentModel,
}: PaymentCheckoutModalProps) {
  const { lang } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<"card" | "monobank" | "liqpay" | "apple_pay">("card");
  const [processing, setProcessing] = useState(false);
  const [successResult, setSuccessResult] = useState<{ txn: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const stageLabel =
    stage === "advance"
      ? (lang === "UA" ? "Авансовий платіж (50%)" : "Advance Deposit (50%)")
      : stage === "balance"
      ? (lang === "UA" ? "Фінальний залишок (50%)" : "Final Balance (50%)")
      : milestoneTitle
      ? milestoneTitle
      : (lang === "UA" ? "100% Повна оплата проєкту" : "100% Full Project Payment");

  const handleProcessPayment = async () => {
    setProcessing(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          projectId,
          milestoneId,
          stage,
          amount,
          currency,
          paymentMethod,
          paymentModel,
          projectTitle,
          invoiceNumber,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Не вдалося провести платіж");
      }

      setSuccessResult({ txn: data.transactionId });
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error("Payment error:", err);
      setErrorMsg(err.message || (lang === "UA" ? "Помилка оплати. Спробуйте ще раз." : "Payment error. Please try again."));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1c1b18]/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-sm border border-[#e4e0d5] bg-white p-6 sm:p-8 shadow-2xl text-[#1c1b18]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#e4e0d5] pb-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8f8c82]">
              {lang === "UA" ? "Онлайн-еквайринг студії" : "Studio Online Acquiring"}
            </span>
            <h3 className="mt-1 font-serif text-2xl font-normal text-[#1c1b18]">
              {lang === "UA" ? "Оплата рахунку" : "Invoice Checkout"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xs border border-[#e4e0d5] bg-[#faf8f5] px-2.5 py-1 text-xs text-[#1c1b18] hover:bg-[#1c1b18] hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {successResult ? (
          /* Success Screen */
          <div className="py-10 text-center space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">
              ✓
            </div>
            <h4 className="font-serif text-2xl font-normal text-[#1c1b18]">
              {lang === "UA" ? "Оплату успішно підтверджено!" : "Payment Successfully Confirmed!"}
            </h4>
            <p className="text-xs text-[#6e6c64]">
              {lang === "UA"
                ? `Суму ${amount} ${currency} зараховано. Сповіщення надіслано в студію.`
                : `Amount of ${amount} ${currency} received. Studio notification dispatched.`}
            </p>
            <div className="inline-block rounded-xs border border-[#e4e0d5] bg-[#faf8f5] px-3 py-1 font-mono text-[11px] text-[#4a4943]">
              ID транзакції: {successResult.txn}
            </div>
          </div>
        ) : (
          /* Payment Form */
          <div className="mt-5 space-y-5">
            {/* Bill Summary */}
            <div className="rounded-sm border border-[#e4e0d5] bg-[#faf8f5] p-4 font-mono text-xs space-y-2">
              <div className="flex justify-between items-center border-b border-[#e4e0d5] pb-2">
                <span className="text-[#8f8c82]">{lang === "UA" ? "Рахунок" : "Invoice"}:</span>
                <span className="font-semibold text-[#1c1b18]">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8f8c82]">{lang === "UA" ? "Об'єкт" : "Project"}:</span>
                <span className="font-medium text-[#1c1b18] truncate max-w-[240px]">{projectTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8f8c82]">{lang === "UA" ? "Призначення" : "Description"}:</span>
                <span className="text-[#4a4943]">{stageLabel}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#e4e0d5]">
                <span className="font-semibold text-[#1c1b18]">{lang === "UA" ? "До сплати" : "Total to pay"}:</span>
                <span className="text-base font-bold text-[#1c1b18]">
                  {amount.toLocaleString()} {currency}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-[#6e6c64] mb-2">
                {lang === "UA" ? "Оберіть спосіб оплати:" : "Select Payment Gateway:"}
              </label>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`cursor-pointer rounded-xs border p-3 text-left transition-all ${
                    paymentMethod === "card"
                      ? "border-[#1c1b18] bg-[#1c1b18] text-white"
                      : "border-[#e4e0d5] bg-white text-[#1c1b18] hover:border-[#1c1b18]"
                  }`}
                >
                  <div className="text-sm">💳</div>
                  <div className="mt-1 font-medium">{lang === "UA" ? "Банківська картка" : "Credit Card"}</div>
                  <div className="text-[10px] opacity-70">Visa / Mastercard</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("monobank")}
                  className={`cursor-pointer rounded-xs border p-3 text-left transition-all ${
                    paymentMethod === "monobank"
                      ? "border-[#1c1b18] bg-[#1c1b18] text-white"
                      : "border-[#e4e0d5] bg-white text-[#1c1b18] hover:border-[#1c1b18]"
                  }`}
                >
                  <div className="text-sm">🐱</div>
                  <div className="mt-1 font-medium">Monobank</div>
                  <div className="text-[10px] opacity-70">mono pay / 1-click</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("liqpay")}
                  className={`cursor-pointer rounded-xs border p-3 text-left transition-all ${
                    paymentMethod === "liqpay"
                      ? "border-[#1c1b18] bg-[#1c1b18] text-white"
                      : "border-[#e4e0d5] bg-white text-[#1c1b18] hover:border-[#1c1b18]"
                  }`}
                >
                  <div className="text-sm">⚡</div>
                  <div className="mt-1 font-medium">LiqPay</div>
                  <div className="text-[10px] opacity-70">Приват24 / QR-код</div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("apple_pay")}
                  className={`cursor-pointer rounded-xs border p-3 text-left transition-all ${
                    paymentMethod === "apple_pay"
                      ? "border-[#1c1b18] bg-[#1c1b18] text-white"
                      : "border-[#e4e0d5] bg-white text-[#1c1b18] hover:border-[#1c1b18]"
                  }`}
                >
                  <div className="text-sm">🍏</div>
                  <div className="mt-1 font-medium">Apple / Google Pay</div>
                  <div className="text-[10px] opacity-70">Безпечний платіж</div>
                </button>
              </div>
            </div>

            {/* Simulated Card Details */}
            {paymentMethod === "card" && (
              <div className="rounded-xs border border-[#e4e0d5] bg-[#faf8f5] p-3.5 space-y-2.5 font-mono text-xs">
                <div>
                  <label className="text-[10px] text-[#8f8c82] block mb-1">
                    {lang === "UA" ? "Номер картки" : "Card Number"}
                  </label>
                  <input
                    type="text"
                    defaultValue="4441 •••• •••• 9012"
                    disabled
                    className="w-full rounded-xs border border-[#e4e0d5] bg-white px-3 py-1.5 text-xs text-[#1c1b18]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#8f8c82] block mb-1">Термін дії</label>
                    <input
                      type="text"
                      defaultValue="12/28"
                      disabled
                      className="w-full rounded-xs border border-[#e4e0d5] bg-white px-3 py-1.5 text-xs text-[#1c1b18]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8f8c82] block mb-1">CVC / CVV</label>
                    <input
                      type="text"
                      defaultValue="•••"
                      disabled
                      className="w-full rounded-xs border border-[#e4e0d5] bg-white px-3 py-1.5 text-xs text-[#1c1b18]"
                    />
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <p className="rounded-xs border border-red-200 bg-red-50 p-2.5 font-mono text-xs text-red-700">
                {errorMsg}
              </p>
            )}

            {/* Note on test simulator */}
            <p className="text-[10px] font-mono leading-relaxed text-[#8f8c82]">
              🔒 {lang === "UA"
                ? "Тестовий еквайринг: імітує миттєвий відгук банку, автоматично оновлює статус замовлення та сповіщає студію."
                : "Secure sandbox acquiring: simulates instant bank confirmation and updates order records."}
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={processing}
                className="w-1/3 cursor-pointer rounded-sm border border-[#e4e0d5] bg-white py-3 text-xs font-mono font-medium text-[#6e6c64] hover:text-[#1c1b18] hover:bg-[#faf8f5] transition-colors disabled:opacity-50"
              >
                {lang === "UA" ? "Скасувати" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={processing}
                className="w-2/3 cursor-pointer rounded-sm bg-[#1c1b18] py-3 text-xs font-medium uppercase tracking-[0.14em] text-white hover:bg-[#33312c] transition-colors disabled:opacity-50"
              >
                {processing
                  ? (lang === "UA" ? "Обробка транзакції..." : "Processing...")
                  : (lang === "UA" ? `Підтвердити оплату (${amount.toLocaleString()} ${currency})` : `Confirm Payment (${amount.toLocaleString()} ${currency})`)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
