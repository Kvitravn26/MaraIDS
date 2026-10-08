"use client";

import { useState } from "react";
import { useApp, Currency } from "@/context/AppContext";

type ServiceType = "viz" | "design" | "complex";

interface ExtraOption {
  id: string;
  labelUa: string;
  labelEn: string;
  priceUsdPerM2: number; // додаткова ціна за м² в USD
  flatPriceUsd?: number;  // або фіксована доплата
}

export default function Calculator() {
  const { lang, currency } = useApp();

  const [service, setService] = useState<ServiceType>("viz");
  const [area, setArea] = useState<number>(80);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Базові ставки за м² в USD
  const BASE_RATES_USD: Record<ServiceType, number> = {
    viz: 15,       // 3D-візуалізація
    design: 35,    // Дизайн інтер'єру
    complex: 45,   // Комплексний проєкт
  };

  // Курси валют відносно USD
  const CURRENCY_RATES: Record<Currency, { rate: number; symbol: string }> = {
    USD: { rate: 1, symbol: "$" },
    EUR: { rate: 0.92, symbol: "€" },
    UAH: { rate: 41.5, symbol: "₴" },
  };

  // Додаткові опції
  const EXTRA_OPTIONS: ExtraOption[] = [
    {
      id: "vr",
      labelUa: "Інтерактивний VR 360° тур",
      labelEn: "Interactive VR 360° Tour",
      priceUsdPerM2: 3,
    },
    {
      id: "animation",
      labelUa: "3D-анімація приміщення (відеоролик)",
      labelEn: "3D Animation Video Walkthrough",
      flatPriceUsd: 250,
    },
    {
      id: "drawings",
      labelUa: "Робочі креслення та специфікації",
      labelEn: "Technical Drawings & Specifications",
      priceUsdPerM2: 10,
    },
    {
      id: "express",
      labelUa: "Експрес-виконання (+30% до швидкості)",
      labelEn: "Express Delivery (+30% speed)",
      priceUsdPerM2: 5,
    },
  ];

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Розрахунок підсумкової вартості в USD
  const basePricePerM2 = BASE_RATES_USD[service];
  let extraPricePerM2 = 0;
  let flatExtraPrice = 0;

  EXTRA_OPTIONS.forEach((opt) => {
    if (selectedOptions.includes(opt.id)) {
      if (opt.priceUsdPerM2) extraPricePerM2 += opt.priceUsdPerM2;
      if (opt.flatPriceUsd) flatExtraPrice += opt.flatPriceUsd;
    }
  });

  const totalUsd = area * (basePricePerM2 + extraPricePerM2) + flatExtraPrice;
  
  // Перерахунок за обраною валютою
  const currentCurrencyInfo = CURRENCY_RATES[currency];
  const finalPrice = Math.round(totalUsd * currentCurrencyInfo.rate);

  return (
    <section id="calculator" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="mb-12 text-center md:text-left">
        <span className="text-xs font-light tracking-[0.3em] uppercase text-zinc-500 block mb-2">
          {lang === "UA" ? "Оцінка вартості" : "Cost Estimation"}
        </span>
        <h2 className="text-3xl md:text-5xl font-extralight tracking-tight text-white">
          {lang === "UA" ? "Інтерактивний калькулятор" : "Interactive Calculator"}
        </h2>
        <p className="text-sm font-light text-zinc-400 mt-3 max-w-xl">
          {lang === "UA"
            ? "Розрахуйте орієнтовну вартість вашого проєкту за декілька кліків."
            : "Estimate the approximate cost of your project in a few clicks."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Панель налаштувань */}
        <div className="lg:col-span-7 flex flex-col gap-8 bg-[#121214] p-8 border border-white/5 rounded-sm">
          
          {/* 1. Вибір послуги */}
          <div>
            <label className="text-xs font-light tracking-[0.2em] uppercase text-zinc-400 block mb-4">
              1. {lang === "UA" ? "Оберіть тип послуги" : "Select Service Type"}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "viz", ua: "3D-Візуалізація", en: "3D Visualization" },
                { id: "design", ua: "Дизайн інтер'єру", en: "Interior Design" },
                { id: "complex", ua: "Комплексний проєкт", en: "Full Complex Project" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setService(item.id as ServiceType)}
                  className={`p-4 text-xs font-light tracking-wider border text-left transition-all duration-300 cursor-pointer ${
                    service === item.id
                      ? "border-white bg-white/10 text-white font-normal"
                      : "border-white/10 text-zinc-400 hover:border-white/30 hover:text-zinc-200"
                  }`}
                >
                  {lang === "UA" ? item.ua : item.en}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Площа приміщення */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-light tracking-[0.2em] uppercase text-zinc-400">
                2. {lang === "UA" ? "Площа приміщення (м²)" : "Area Size (sq m)"}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={1000}
                  value={area}
                  onChange={(e) => setArea(Math.max(1, Number(e.target.value)))}
                  className="w-20 bg-black/50 border border-white/20 text-center text-white text-sm py-1 font-mono focus:border-white focus:outline-none"
                />
                <span className="text-xs text-zinc-500">m²</span>
              </div>
            </div>

            <input
              type="range"
              min={15}
              max={500}
              step={5}
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <div className="flex justify-between text-[10px] text-zinc-600 mt-2 font-mono">
              <span>15 m²</span>
              <span>250 m²</span>
              <span>500+ m²</span>
            </div>
          </div>

          {/* 3. Додаткові опції */}
          <div>
            <label className="text-xs font-light tracking-[0.2em] uppercase text-zinc-400 block mb-4">
              3. {lang === "UA" ? "Додаткові опції" : "Additional Options"}
            </label>
            <div className="flex flex-col gap-3">
              {EXTRA_OPTIONS.map((opt) => {
                const isSelected = selectedOptions.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleOption(opt.id)}
                    className={`flex items-center justify-between p-4 border text-xs font-light transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? "border-white/60 bg-white/5 text-white"
                        : "border-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-300"
                    }`}
                  >
                    <span className="tracking-wide">
                      {lang === "UA" ? opt.labelUa : opt.labelEn}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-zinc-500">
                        {opt.priceUsdPerM2
                          ? `+${Math.round(opt.priceUsdPerM2 * currentCurrencyInfo.rate)} ${currentCurrencyInfo.symbol}/m²`
                          : `+${Math.round((opt.flatPriceUsd || 0) * currentCurrencyInfo.rate)} ${currentCurrencyInfo.symbol}`}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${
                          isSelected ? "bg-white border-white text-black" : "border-zinc-700"
                        }`}
                      >
                        {isSelected && <span className="text-[10px] leading-none">✓</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Картка підсумкового розрахунку */}
        <div className="lg:col-span-5 bg-[#121214] border border-white/10 p-8 rounded-sm sticky top-28 flex flex-col justify-between gap-8">
          <div>
            <span className="text-[10px] font-light tracking-[0.3em] uppercase text-zinc-500 block mb-1">
              {lang === "UA" ? "Підсумковий розрахунок" : "Total Estimation"}
            </span>
            <div className="flex items-baseline gap-2 my-4">
              <span className="text-4xl sm:text-5xl font-extralight text-white font-mono">
                {finalPrice.toLocaleString()}
              </span>
              <span className="text-xl font-light text-zinc-400">
                {currentCurrencyInfo.symbol}
              </span>
            </div>

            <div className="space-y-3 pt-6 border-t border-white/10 text-xs font-light text-zinc-400">
              <div className="flex justify-between">
                <span>{lang === "UA" ? "Обрана послуга:" : "Selected service:"}</span>
                <span className="text-zinc-200">
                  {service === "viz"
                    ? lang === "UA" ? "3D-Візуалізація" : "3D Visualization"
                    : service === "design"
                    ? lang === "UA" ? "Дизайн інтер'єру" : "Interior Design"
                    : lang === "UA" ? "Комплексний проєкт" : "Full Complex Project"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{lang === "UA" ? "Площа:" : "Area size:"}</span>
                <span className="text-zinc-200 font-mono">{area} m²</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === "UA" ? "Обрані опції:" : "Selected extras:"}</span>
                <span className="text-zinc-200 font-mono">{selectedOptions.length}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="#contact"
              className="w-full py-4 bg-white text-black text-center text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 hover:bg-zinc-200 cursor-pointer block"
            >
              {lang === "UA" ? "Замовити за цією ціною" : "Order at This Price"}
            </a>
            <p className="text-[10px] text-center font-extralight text-zinc-500 leading-relaxed">
              * {lang === "UA"
                ? "Розрахунок є орієнтовним та не є публічною офертою. Фінальна вартість формується після ТЗ."
                : "Estimation is approximate and depends on final technical requirements."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}