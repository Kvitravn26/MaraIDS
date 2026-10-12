"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";

function ContactsForm() {
  const searchParams = useSearchParams();
  const { lang } = useApp();

  const areaFromCalc = searchParams.get("area") || "";
  const serviceFromCalc = searchParams.get("service") || "";
  const priceFromCalc = searchParams.get("price") || "";
  const currencyFromCalc = searchParams.get("currency") || "UAH";

  const [name, setName] = useState("");
  const [area, setArea] = useState(areaFromCalc);
  const [message, setMessage] = useState(() => {
    if (!areaFromCalc) return "";
    return lang === "UA"
      ? `Бажана послуга: ${serviceFromCalc}, орієнтовна вартість: ${priceFromCalc} ${currencyFromCalc}`
      : `Requested service: ${serviceFromCalc}, estimated cost: ${priceFromCalc} ${currencyFromCalc}`;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(lang === "UA" ? "Запит успішно надіслано у студію!" : "Your request has been sent to the studio!");
  };

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 pb-20 pt-32 text-[#1c1b18] sm:px-8">
      <div className="mb-8 border-b border-[#e4e0d5] pb-6">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#8f8c82]">
          {lang === "UA" ? "Зв’язок зі студією" : "Contact the Studio"}
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1c1b18]">
          {lang === "UA" ? "Розкажіть про ваш проєкт" : "Tell Us About Your Project"}
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-sm border border-[#e4e0d5] bg-white p-8 sm:p-10 shadow-xs">
        <div>
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
            {lang === "UA" ? "Ваше ім’я" : "Your Name"}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-sm border border-[#e4e0d5] bg-[#faf8f5] px-4 py-3 text-xs text-[#1c1b18] focus:border-[#1c1b18] focus:bg-white focus:outline-none"
            placeholder={lang === "UA" ? "Ім’я Прізвище" : "Full Name"}
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
            {lang === "UA" ? "Орієнтовна площа (м²)" : "Approximate Area (sq m)"}
          </label>
          <input
            type="number"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full rounded-sm border border-[#e4e0d5] bg-[#faf8f5] px-4 py-3 font-mono text-xs text-[#1c1b18] focus:border-[#1c1b18] focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
            {lang === "UA" ? "Деталі проєкту / Повідомлення" : "Project Details / Message"}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-28 resize-none rounded-sm border border-[#e4e0d5] bg-[#faf8f5] p-4 text-xs leading-relaxed text-[#1c1b18] focus:border-[#1c1b18] focus:bg-white focus:outline-none"
            placeholder={lang === "UA" ? "Опишіть ваші побажання щодо простору чи термінів..." : "Describe what you have in mind regarding space or timeline..."}
          />
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer rounded-sm bg-[#1c1b18] py-4 text-xs font-medium uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#33312c] sm:w-auto sm:px-8"
        >
          {lang === "UA" ? "Надіслати запит у студію" : "Send Request to Studio"}
        </button>
      </form>
    </main>
  );
}

export default function ContactsPage() {
  const { lang } = useApp();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] text-xs font-mono text-[#8f8c82]">
          {lang === "UA" ? "Завантаження..." : "Loading..."}
        </div>
      }
    >
      <ContactsForm />
    </Suspense>
  );
}