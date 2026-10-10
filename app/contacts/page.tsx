"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ContactsForm() {
  const searchParams = useSearchParams();

  // Зчитуємо дані з URL
  const areaFromCalc = searchParams.get("area") || "";
  const serviceFromCalc = searchParams.get("service") || "";
  const priceFromCalc = searchParams.get("price") || "";
  const currencyFromCalc = searchParams.get("currency") || "UAH";

  // Локальний стейт форми
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState(areaFromCalc);
  const [message, setMessage] = useState("");

  // Оновлюємо площу, якщо вона передана з калькулятора
  useEffect(() => {
    if (areaFromCalc) {
      setArea(areaFromCalc);
      setMessage(`Бажана послуга: ${serviceFromCalc}, орієнтовна вартість: ${priceFromCalc} ${currencyFromCalc}`);
    }
  }, [areaFromCalc, serviceFromCalc, priceFromCalc, currencyFromCalc]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Логіка відправки форми у базу (таблицю leads) або на пошту/Telegram
    alert("Запит успішно надіслано у студію!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Ваші поля форми */}
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Ваше ім'я</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white"
          placeholder="Ім'я Прізвище"
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Орієнтовна площа (м²)</label>
        <input
          type="number"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white"
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Деталі проєкту / повідомлення</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white h-24"
          placeholder="Опишіть ваші побажання..."
        />
      </div>

      <button
        type="submit"
        className="w-full bg-white text-black font-semibold py-4 rounded-xl text-xs uppercase tracking-wider hover:bg-zinc-200 transition"
      >
        Надіслати запит у студію
      </button>
    </form>
  );
}

export default function ContactsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070708] text-white flex items-center justify-center font-mono">Завантаження...</div>}>
      <ContactsForm />
    </Suspense>
  );
}