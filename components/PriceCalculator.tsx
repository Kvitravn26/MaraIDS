"use client";

import { useState } from "react";
import { useApp, CURRENCY_RATES, Currency } from "@/context/AppContext";
import { COUNTRY_CODES } from "@/lib/countryCodes";

type ServiceType = "viz" | "design" | "full";

const SERVICES: Record<
  ServiceType,
  { titleUa: string; titleEn: string; descUa: string; descEn: string; pricePerSqm: number }
> = {
  viz: {
    titleUa: "3D-візуалізація",
    titleEn: "3D Visualization",
    descUa: "Фотореалістичні рендери за вашим готовим дизайн-проєктом або планом",
    descEn: "Photorealistic renders based on your ready design project or floor plan",
    pricePerSqm: 622,
  },
  design: {
    titleUa: "Дизайн інтер'єру",
    titleEn: "Interior Design",
    descUa: "Розробка концепції, планування, підбір оздоблення та 3D-моделювання",
    descEn: "Concept design, space planning, material curation & 3D modeling",
    pricePerSqm: 1037,
  },
  full: {
    titleUa: "Комплексний проєкт",
    titleEn: "Full Project",
    descUa: "Повний пакет: дизайн, робочі креслення, специфікації та VR-панорами",
    descEn: "Turnkey package: interior design, technical blueprints, specs & VR",
    pricePerSqm: 1452,
  },
};

type OptionKey = "vr" | "animation" | "blueprints" | "express";

interface OptionConfigItem {
  ua: string;
  en: string;
  priceUah: number;
  isPerSqm: boolean;
  isMultiplier?: boolean;
}

const OPTION_CONFIG: Record<OptionKey, OptionConfigItem> = {
  vr: {
    ua: "Інтерактивний VR 360° тур",
    en: "Interactive VR 360° Tour",
    priceUah: 125,
    isPerSqm: true,
  },
  animation: {
    ua: "3D-анімація приміщення (відео)",
    en: "3D Room Animation (Video walkthrough)",
    priceUah: 10375,
    isPerSqm: false,
  },
  blueprints: {
    ua: "Робочі креслення та специфікації",
    en: "Working Blueprints & Specifications",
    priceUah: 415,
    isPerSqm: true,
  },
  express: {
    ua: "Експрес-терміни (+30% до швидкості)",
    en: "Express Delivery (+30% faster turnaround)",
    priceUah: 0,
    isPerSqm: false,
    isMultiplier: true,
  },
};

export default function Calculator() {
  const { lang, currency, setCurrency, formatPrice } = useApp();

  const [service, setService] = useState<ServiceType>("viz");
  const [area, setArea] = useState<number>(85);
  const [options, setOptions] = useState<Record<OptionKey, boolean>>({
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

  // Rate & Symbol calculation
  const curConfig = CURRENCY_RATES[currency];

  const calculateOptionPrice = (key: OptionKey): number => {
    const opt = OPTION_CONFIG[key];
    if (opt.isMultiplier) return 0;
    const baseUah = opt.isPerSqm ? opt.priceUah * area : opt.priceUah;
    return Math.round(baseUah * curConfig.rate);
  };

  const formatOptionDisplay = (key: OptionKey): string => {
    const opt = OPTION_CONFIG[key];
    if (opt.isMultiplier) return "+30%";
    const convertedUnit = Math.round(opt.priceUah * curConfig.rate);
    const unitFormatted = `${convertedUnit.toLocaleString(lang === "UA" ? "uk-UA" : "en-US")} ${curConfig.symbol}`;
    return opt.isPerSqm
      ? `+${unitFormatted} / ${lang === "UA" ? "м²" : "m²"}`
      : `+${unitFormatted}`;
  };

  // Base service calculation
  const basePriceUah = area * SERVICES[service].pricePerSqm;
  let totalUah = basePriceUah;
  if (options.vr) totalUah += area * OPTION_CONFIG.vr.priceUah;
  if (options.animation) totalUah += OPTION_CONFIG.animation.priceUah;
  if (options.blueprints) totalUah += area * OPTION_CONFIG.blueprints.priceUah;
  if (options.express) totalUah *= 1.3;

  const finalConvertedTotal = Math.round(totalUah * curConfig.rate);
  const serviceTitle = lang === "UA" ? SERVICES[service].titleUa : SERVICES[service].titleEn;

  const toggleOption = (key: OptionKey) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fullContact =
      selectedCode === "email" ? phoneOrContact : `${selectedCode} ${phoneOrContact}`;

    const activeOptionsList = Object.entries(options)
      .filter(([_, val]) => val)
      .map(([k]) => (lang === "UA" ? OPTION_CONFIG[k as OptionKey].ua : OPTION_CONFIG[k as OptionKey].en))
      .join(", ");

    try {
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          contact: fullContact,
          propertyType: serviceTitle,
          area: area.toString(),
          message: `${lang === "UA" ? "Заявка з калькулятора" : "Calculator request"}:\n- ${
            lang === "UA" ? "Послуга" : "Service"
          }: ${serviceTitle}\n- ${lang === "UA" ? "Площа" : "Area"}: ${area} m²\n- ${
            lang === "UA" ? "Опції" : "Options"
          }: ${activeOptionsList || (lang === "UA" ? "немає" : "none")}\n- ${
            lang === "UA" ? "Розрахована сума" : "Estimated total"
          }: ${finalConvertedTotal.toLocaleString(lang === "UA" ? "uk-UA" : "en-US")} ${curConfig.symbol} (${currency})`,
        }),
      });

      if (!response.ok) throw new Error("Failed to send");
      setSubmitted(true);
    } catch {
      setError(
        lang === "UA"
          ? "Помилка відправки. Будь ласка, спробуйте ще раз або зв'яжіться з нами напряму."
          : "Failed to send. Please try again or reach out to us directly."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-[1600px] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
      {/* Header bar */}
      <div className="flex flex-col items-start justify-between gap-6 border-b border-[#e4e0d5] pb-8 md:flex-row md:items-end">
        <div>
          <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-[#6e6c64]">
            {lang === "UA" ? "Оцінка вартості & Калькулятор" : "Estimation & Project Calculator"}
          </span>
          <h2 className="mt-3 text-3xl font-medium tracking-tight text-[#1c1b18] sm:text-5xl">
            {lang === "UA" ? "Інтерактивний розрахунок" : "Interactive Cost Calculator"}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#6e6c64]">
            {lang === "UA"
              ? "Оберіть параметри вашого простору для прозорої оцінки вартості візуалізації та проєктування."
              : "Choose space parameters for a clear, instant estimation of visualization and design services."}
          </p>
        </div>

        {/* Currency Switcher Buttons */}
        <div className="flex items-center gap-1.5 rounded-sm border border-[#e4e0d5] bg-[#f4f0e8] p-1 font-mono text-xs">
          <span className="px-2 text-[10px] uppercase tracking-wider text-[#6e6c64]">
            {lang === "UA" ? "Валюта:" : "Currency:"}
          </span>
          {(["UAH", "USD", "EUR"] as Currency[]).map((cur) => (
            <button
              key={cur}
              onClick={() => setCurrency(cur)}
              className={`cursor-pointer px-3 py-1.5 transition-all ${
                currency === cur
                  ? "bg-[#1c1b18] font-medium text-white shadow-xs"
                  : "text-[#6e6c64] hover:text-[#1c1b18]"
              }`}
            >
              {cur === "UAH" ? "₴ UAH" : cur === "USD" ? "$ USD" : "€ EUR"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Left Inputs Column */}
        <div className="space-y-10 lg:col-span-7">
          {/* Step 1: Service Type */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1c1b18]">
                {lang === "UA" ? "1. Оберіть тип послуги" : "1. Select Service Type"}
              </h3>
              <span className="text-[11px] text-[#6e6c64]">
                {lang === "UA" ? "Тариф за метр квадратний" : "Rate per sq m"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {(Object.keys(SERVICES) as ServiceType[]).map((key) => {
                const s = SERVICES[key];
                const isSelected = service === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setService(key)}
                    className={`cursor-pointer rounded-sm border p-4.5 text-left transition-all ${
                      isSelected
                        ? "border-[#1c1b18] bg-white shadow-sm ring-1 ring-[#1c1b18]"
                        : "border-[#e4e0d5] bg-[#faf8f5] hover:border-[#1c1b18]/40 hover:bg-white"
                    }`}
                  >
                    <div className="text-sm font-medium text-[#1c1b18]">
                      {lang === "UA" ? s.titleUa : s.titleEn}
                    </div>
                    <div className="mt-2 text-xs font-mono font-medium text-[#1c1b18]">
                      {formatPrice(s.pricePerSqm)} / {lang === "UA" ? "м²" : "m²"}
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-[#6e6c64]">
                      {lang === "UA" ? s.descUa : s.descEn}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Area slider */}
          <div className="space-y-5 border-t border-[#e4e0d5] pt-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1c1b18]">
                  {lang === "UA" ? "2. Площа простору" : "2. Space Area"}
                </h3>
                <p className="mt-1 text-[11px] text-[#6e6c64]">
                  {lang === "UA" ? "Вкажіть орієнтовну загальну площу" : "Specify approximate total area"}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-sm border border-[#e4e0d5] bg-white px-3.5 py-1.5 shadow-xs">
                <input
                  type="number"
                  min="1"
                  max="2000"
                  value={area}
                  onChange={(e) => setArea(Math.max(1, Number(e.target.value)))}
                  className="w-14 bg-transparent text-right font-mono text-base font-medium text-[#1c1b18] focus:outline-none"
                />
                <span className="font-mono text-xs text-[#6e6c64]">m²</span>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="15"
                max="500"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-sm bg-[#e4e0d5] accent-[#1c1b18]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#8f8c82]">
                <span>15 m²</span>
                <span>150 m²</span>
                <span>300 m²</span>
                <span>500+ m²</span>
              </div>
            </div>
          </div>

          {/* Step 3: Additional Options (Fixed currency conversion and symbol update) */}
          <div className="space-y-4 border-t border-[#e4e0d5] pt-8">
            <div className="flex items-baseline justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1c1b18]">
                {lang === "UA" ? "3. Додаткові опції" : "3. Additional Options"}
              </h3>
              <span className="text-[11px] font-mono text-[#6e6c64]">
                {lang === "UA" ? `Ціни в ${currency} (${curConfig.symbol})` : `Prices in ${currency} (${curConfig.symbol})`}
              </span>
            </div>

            <div className="divide-y divide-[#e4e0d5] rounded-sm border border-[#e4e0d5] bg-white">
              {(Object.keys(OPTION_CONFIG) as OptionKey[]).map((key) => {
                const opt = OPTION_CONFIG[key];
                const isChecked = options[key];
                const priceBadge = formatOptionDisplay(key);

                return (
                  <label
                    key={key}
                    onClick={() => toggleOption(key)}
                    className="flex cursor-pointer items-center justify-between p-4.5 transition-colors hover:bg-[#faf8f5]"
                  >
                    <div className="flex items-center gap-3.5 pr-4">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="size-4.5 cursor-pointer accent-[#1c1b18]"
                      />
                      <span className="text-xs font-medium text-[#1c1b18]">
                        {lang === "UA" ? opt.ua : opt.en}
                      </span>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="inline-block rounded-xs bg-[#f4f0e8] px-2.5 py-1 font-mono text-xs font-medium text-[#1c1b18]">
                        {priceBadge}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Summary & Order Card */}
        <div className="sticky top-28 space-y-6 rounded-sm border border-[#e4e0d5] bg-white p-6 shadow-sm sm:p-8 lg:col-span-5">
          <div className="border-b border-[#e4e0d5] pb-4">
            <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#6e6c64]">
              {lang === "UA" ? "Підсумкова вартість проєкту" : "Total Project Estimate"}
            </span>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-medium tracking-tight text-[#1c1b18] sm:text-5xl font-mono">
                {finalConvertedTotal.toLocaleString(lang === "UA" ? "uk-UA" : "en-US")}
              </span>
              <span className="text-xl font-normal text-[#6e6c64] font-mono">
                {curConfig.symbol}
              </span>
              <span className="text-xs text-[#8f8c82] font-mono">
                ({currency})
              </span>
            </div>
          </div>

          {/* Breakdown list */}
          <div className="space-y-2.5 border-b border-[#e4e0d5] pb-5 text-xs">
            <div className="flex justify-between text-[#6e6c64]">
              <span>{lang === "UA" ? "Обрана послуга:" : "Selected service:"}</span>
              <span className="font-medium text-[#1c1b18]">{serviceTitle}</span>
            </div>
            <div className="flex justify-between text-[#6e6c64]">
              <span>{lang === "UA" ? "Площа:" : "Space area:"}</span>
              <span className="font-medium font-mono text-[#1c1b18]">{area} m²</span>
            </div>
            <div className="flex justify-between text-[#6e6c64]">
              <span>{lang === "UA" ? "Базова вартість:" : "Base price:"}</span>
              <span className="font-mono text-[#1c1b18]">
                {Math.round(basePriceUah * curConfig.rate).toLocaleString(lang === "UA" ? "uk-UA" : "en-US")} {curConfig.symbol}
              </span>
            </div>

            {/* Selected options breakdown */}
            {Object.entries(options).some(([_, v]) => v) && (
              <div className="pt-2 border-t border-[#e4e0d5]/60 space-y-1.5">
                <span className="block text-[10px] uppercase font-semibold tracking-wider text-[#8f8c82]">
                  {lang === "UA" ? "Активні опції:" : "Active options:"}
                </span>
                {(Object.keys(options) as OptionKey[])
                  .filter((k) => options[k])
                  .map((k) => (
                    <div key={k} className="flex justify-between text-[11px] text-[#6e6c64]">
                      <span className="truncate pr-2">{lang === "UA" ? OPTION_CONFIG[k].ua : OPTION_CONFIG[k].en}</span>
                      <span className="shrink-0 font-mono text-[#1c1b18]">
                        {OPTION_CONFIG[k].isMultiplier
                          ? "+30%"
                          : `+${calculateOptionPrice(k).toLocaleString(lang === "UA" ? "uk-UA" : "en-US")} ${curConfig.symbol}`}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Order form */}
          {submitted ? (
            <div className="space-y-3 rounded-sm border border-[#e4e0d5] bg-[#faf8f5] p-6 text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-[#1c1b18] text-white">
                ✓
              </div>
              <h4 className="text-sm font-medium text-[#1c1b18]">
                {lang === "UA" ? "Заявку успішно відправлено!" : "Request successfully submitted!"}
              </h4>
              <p className="text-xs text-[#6e6c64]">
                {lang === "UA"
                  ? "Наш арт-директор зв'яжеться з вами найближчим часом для уточнення деталей та ТЗ."
                  : "Our art director will get in touch shortly to discuss details and requirements."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              {error && (
                <div className="rounded-sm border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
                  {lang === "UA" ? "Ваше ім'я" : "Your Name"}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === "UA" ? "Олександр / Ірина" : "Alex / Sarah"}
                  className="w-full rounded-sm border border-[#e4e0d5] bg-[#faf8f5] px-3.5 py-2.5 text-xs text-[#1c1b18] focus:border-[#1c1b18] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
                  {lang === "UA" ? "Контакт (Телефон або Telegram / Email)" : "Contact (Phone, Telegram, or Email)"}
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedCode}
                    onChange={(e) => setSelectedCode(e.target.value)}
                    className="max-w-[130px] truncate rounded-sm border border-[#e4e0d5] bg-[#faf8f5] px-2.5 py-2.5 text-[11px] font-mono text-[#1c1b18] focus:border-[#1c1b18] focus:bg-white focus:outline-none"
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
                    placeholder={selectedCode === "email" ? "hello@domain.com / @username" : "67 123 4567"}
                    className="w-full rounded-sm border border-[#e4e0d5] bg-[#faf8f5] px-3.5 py-2.5 text-xs font-mono text-[#1c1b18] focus:border-[#1c1b18] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer rounded-sm bg-[#1c1b18] py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#33312c] disabled:opacity-50"
              >
                {loading
                  ? lang === "UA"
                    ? "Надсилання..."
                    : "Sending..."
                  : lang === "UA"
                  ? "Отримати пропозицію за розрахунком"
                  : "Get Offer Based on Estimate"}
              </button>
            </form>
          )}

          <p className="text-center text-[10px] text-[#8f8c82]">
            {lang === "UA"
              ? "* Розрахунок є орієнтовним. Точний кошторис фіксується після затвердження обмірного плану та ТЗ."
              : "* Calculation is approximate. Exact budget is confirmed upon floor plan & brief review."}
          </p>
        </div>
      </div>
    </section>
  );
}