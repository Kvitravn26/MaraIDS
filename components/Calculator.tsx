"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { COUNTRY_CODES } from "@/lib/countryCodes";

type ServiceType = "viz" | "design" | "full";
type CurrencyKey = "UAH" | "USD" | "EUR";

const SERVICES: Record<ServiceType, { title: string; pricePerSqm: number }> = {
  viz: { title: "3D-Візуалізація", pricePerSqm: 550 },
  design: { title: "Дизайн інтер'єру", pricePerSqm: 1120 },
  full: { title: "Комплексний проєкт", pricePerSqm: 1452 },
};

const CURRENCIES: Record<CurrencyKey, { symbol: string; rate: number }> = {
  UAH: { symbol: "₴", rate: 1 },
  USD: { symbol: "$", rate: 0.024 },
  EUR: { symbol: "€", rate: 0.022 },
};

export default function Calculator() {
  const { lang } = useApp();
  
  const [service, setService] = useState<ServiceType>("viz");
  const [area, setArea] = useState<number>(80);
  const [currency, setCurrency] = useState<CurrencyKey>("UAH");

  const [options, setOptions] = useState({
    vr: false,
    animation: false,
    blueprints: false,
    express: false,
  });

  const [name, setName] = useState("");
  const [selectedCode, setSelectedCode] = useState("+380");
  const [phoneOrContact, setPhoneOrContact] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  let basePriceUah = area * SERVICES[service].pricePerSqm;
  if (options.vr) basePriceUah += area * 125;
  if (options.animation) basePriceUah += 10375;
  if (options.blueprints) basePriceUah += area * 415;
  if (options.express) basePriceUah *= 1.3;

  const currentCurrency = CURRENCIES[currency];
  const finalPrice = Math.round(basePriceUah * currentCurrency.rate);

  const toggleOption = (key: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fullContact =
      selectedCode === "email"
        ? phoneOrContact
        : `${selectedCode} ${phoneOrContact}`;

    const activeOptionsList = Object.entries(options)
      .filter(([_, val]) => val)
      .map(([key]) => key)
      .join(", ");

    try {
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          contact: fullContact,
          propertyType: SERVICES[service].title,
          area: area.toString(),
          message: `Заявка з Калькулятора:\n- Послуга: ${SERVICES[service].title}\n- Площа: ${area} м²\n- Опції: ${activeOptionsList || "немає"}\n- Розрахована сума: ${finalPrice.toLocaleString()} ${currency}`,
        }),
      });

      if (!response.ok) throw new Error("Failed to send");

      setSubmitted(true);
    } catch (err) {
      setError(
        lang === "UA"
          ? "Помилка відправки. Спробуйте ще раз."
          : "Failed to send. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto text-white font-sans space-y-8 p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-6">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">
            {lang === "UA" ? "Оцінка вартості" : "Cost Estimation"}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-1">
            {lang === "UA" ? "Інтерактивний калькулятор" : "Interactive Calculator"}
          </h2>
          <p className="text-sm text-zinc-400 mt-2">
            {lang === "UA"
              ? "Розрахуйте орієнтовну вартість та замовте консультацію в один клік."
              : "Calculate estimated cost and request a consultation in one click."}
          </p>
        </div>

        <div className="flex items-center bg-zinc-900 border border-white/10 rounded-lg p-1">
          {(["UAH", "USD", "EUR"] as CurrencyKey[]).map((cur) => (
            <button
              key={cur}
              onClick={() => setCurrency(cur)}
              className={`px-3 py-1 text-xs font-mono font-medium rounded transition ${
                currency === cur ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              {cur === "UAH" ? "₴" : cur === "USD" ? "$" : "€"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-8 bg-zinc-950/60 border border-white/10 p-6 sm:p-8 rounded-2xl">
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
              {lang === "UA" ? "1. Оберіть тип послуги" : "1. Select Service Type"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.keys(SERVICES) as ServiceType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setService(key)}
                  className={`p-4 rounded-xl text-xs font-medium border text-left transition ${
                    service === key
                      ? "bg-zinc-800 border-white text-white font-semibold"
                      : "bg-zinc-900/50 border-white/5 text-zinc-400 hover:border-white/20"
                  }`}
                >
                  {SERVICES[key].title}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
                {lang === "UA" ? "2. Площа приміщення (м²)" : "2. Area (sq m)"}
              </h3>
              <div className="flex items-center space-x-2 bg-zinc-900 border border-white/10 rounded-lg px-3 py-1">
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(Math.max(1, Number(e.target.value)))}
                  className="w-12 bg-transparent text-right font-mono text-sm text-white focus:outline-none"
                />
                <span className="text-xs text-zinc-500 font-mono">m²</span>
              </div>
            </div>

            <input
              type="range"
              min="15"
              max="500"
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full accent-white cursor-pointer bg-zinc-800 rounded-lg h-1.5"
            />
          </div>

          <div className="space-y-3 pt-4 border-t border-white/5">
            <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
              {lang === "UA" ? "3. Додаткові опції" : "3. Additional Options"}
            </h3>
            <div className="space-y-2">
              <label onClick={() => toggleOption("vr")} className="flex justify-between items-center bg-zinc-900/40 border border-white/5 p-3.5 rounded-xl cursor-pointer hover:border-white/20 transition">
                <span className="text-xs text-zinc-300">Інтерактивний VR 360° тур</span>
                <div className="flex items-center space-x-3">
                  <span className="text-[11px] font-mono text-zinc-500">+125 ₴/м²</span>
                  <input type="checkbox" checked={options.vr} onChange={() => {}} className="accent-white w-4 h-4 rounded" />
                </div>
              </label>

              <label onClick={() => toggleOption("animation")} className="flex justify-between items-center bg-zinc-900/40 border border-white/5 p-3.5 rounded-xl cursor-pointer hover:border-white/20 transition">
                <span className="text-xs text-zinc-300">3D-анімація приміщення (відеоролик)</span>
                <div className="flex items-center space-x-3">
                  <span className="text-[11px] font-mono text-zinc-500">+10375 ₴</span>
                  <input type="checkbox" checked={options.animation} onChange={() => {}} className="accent-white w-4 h-4 rounded" />
                </div>
              </label>

              <label onClick={() => toggleOption("blueprints")} className="flex justify-between items-center bg-zinc-900/40 border border-white/5 p-3.5 rounded-xl cursor-pointer hover:border-white/20 transition">
                <span className="text-xs text-zinc-300">Робочі креслення та специфікації</span>
                <div className="flex items-center space-x-3">
                  <span className="text-[11px] font-mono text-zinc-500">+415 ₴/м²</span>
                  <input type="checkbox" checked={options.blueprints} onChange={() => {}} className="accent-white w-4 h-4 rounded" />
                </div>
              </label>

              <label onClick={() => toggleOption("express")} className="flex justify-between items-center bg-zinc-900/40 border border-white/5 p-3.5 rounded-xl cursor-pointer hover:border-white/20 transition">
                <span className="text-xs text-zinc-300">Експрес-виконання (+30% до швидкості)</span>
                <div className="flex items-center space-x-3">
                  <span className="text-[11px] font-mono text-zinc-500">+30%</span>
                  <input type="checkbox" checked={options.express} onChange={() => {}} className="accent-white w-4 h-4 rounded" />
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-zinc-950 border border-white/10 p-6 sm:p-8 rounded-2xl space-y-6">
          <p className="text-xs font-mono uppercase text-zinc-500 tracking-wider">
            {lang === "UA" ? "Підсумковий розрахунок" : "Total Calculation"}
          </p>

          <div className="flex items-baseline space-x-2">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              {finalPrice.toLocaleString()}
            </span>
            <span className="text-2xl font-light text-zinc-400">{currentCurrency.symbol}</span>
          </div>

          <div className="space-y-2 pt-4 border-t border-white/10 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>{lang === "UA" ? "Послуга:" : "Service:"}</span>
              <span className="text-white font-medium">{SERVICES[service].title}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>{lang === "UA" ? "Площа:" : "Area:"}</span>
              <span className="text-white font-medium">{area} м²</span>
            </div>
          </div>

          {submitted ? (
            <div className="py-6 text-center bg-zinc-900 border border-white/10 rounded-xl space-y-2">
              <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center mx-auto text-sm font-bold">✓</div>
              <p className="text-xs font-medium text-white">
                {lang === "UA" ? "Запит успішно надіслано!" : "Request Sent Successfully!"}
              </p>
              <p className="text-[11px] text-zinc-400">
                {lang === "UA" ? "Ми зв'яжемося з вами найближчим часом." : "We will contact you shortly."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="space-y-4 pt-2">
              {error && <p className="text-red-400 text-xs">{error}</p>}

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500 mb-1">
                  {lang === "UA" ? "Ваше ім'я" : "Your Name"}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 px-3 py-2.5 text-xs text-white focus:border-white focus:outline-none rounded-lg"
                  placeholder={lang === "UA" ? "Ім'я Прізвище" : "Your Name"}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-500 mb-1">
                  {lang === "UA" ? "Телефон / Контакт" : "Phone / Contact"}
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedCode}
                    onChange={(e) => setSelectedCode(e.target.value)}
                    className="bg-black border border-white/10 px-2 py-2.5 text-[11px] text-white focus:border-white focus:outline-none rounded-lg font-mono max-w-[130px] truncate"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {lang === "UA" ? c.ua : c.en}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    value={phoneOrContact}
                    onChange={(e) => setPhoneOrContact(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 px-3 py-2.5 text-xs text-white focus:border-white focus:outline-none rounded-lg font-mono"
                    placeholder={selectedCode === "email" ? "email / @tg" : "67 123 4567"}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-semibold py-3.5 rounded-xl text-xs uppercase tracking-wider hover:bg-zinc-200 transition cursor-pointer shadow-lg disabled:opacity-50 mt-2"
              >
                {loading
                  ? lang === "UA" ? "Надсилання..." : "Sending..."
                  : lang === "UA" ? "Зв'яжіться зі мною" : "Contact Me"}
              </button>
            </form>
          )}

          <p className="text-[10px] text-zinc-500 leading-relaxed text-center pt-2">
            {lang === "UA"
              ? "* Розрахунок є орієнтовним. Фінальна вартість формується після узгодження ТЗ."
              : "* Estimated calculation. Final price is set after specification review."}
          </p>
        </div>
      </div>
    </div>
  );
}