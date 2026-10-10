"use client";

import { useApp } from "@/context/AppContext";
import PriceCalculator from "@/components/PriceCalculator";

export default function Services() {
  return (
    <section id="services" className="py-20">
      {/* Ваш блок послуг */}
      <PriceCalculator />
    </section>
  );
}
interface ServiceTier {
  titleUa: string;
  titleEn: string;
  priceUa: number;
  priceUsd: number;
  priceEur: number;
  unitUa: string;
  unitEn: string;
  descUa: string;
  descEn: string;
  featuresUa: string[];
  featuresEn: string[];
  popular?: boolean;
}

const SERVICES: ServiceTier[] = [
  {
    titleUa: "Базовий (Україна / ЄС)",
    titleEn: "Basic (UA / EU)",
    priceUa: 25,
    priceUsd: 25,
    priceEur: 23,
    unitUa: "за м²",
    unitEn: "per sq.m",
    descUa: "Ідеально для швидкого старту ремонту з повним набором необхідних креслень та базовою візуалізацією.",
    descEn: "Ideal for a quick renovation start with a complete set of technical drawings and basic visualization.",
    featuresUa: [
      "Планувальні рішення (2-3 варіанти)",
      "Технічні креслення (монтаж, розетки, світло)",
      "Базові 3D-візуалізації основних зон",
      "Специфікація матеріалів та сантехніки"
    ],
    featuresEn: [
      "Floor plan options (2-3 variants)",
      "Technical drawings (lighting, power, layout)",
      "Basic 3D renders of main areas",
      "Material and plumbing specifications"
    ]
  },
  {
    titleUa: "Преміум Візуалізація та Проєкт",
    titleEn: "Full Interior Design & 3D",
    priceUa: 40,
    priceUsd: 40,
    priceEur: 38,
    unitUa: "за м²",
    unitEn: "per sq.m",
    descUa: "Повний комплекс послуг: детальний дизайн-проєкт, фотореалістичний 3D рендеринг та супровід.",
    descEn: "Full service package: detailed interior design project, photorealistic 3D rendering, and support.",
    featuresUa: [
      "Повний комплект робочої документації",
      "Фотореалістичні 3D візуалізації всіх приміщень",
      "Підбір реальних меблів, світла та оздоблення",
      "Авторський нагляд (консультації будівельників)"
    ],
    featuresEn: [
      "Complete working documentation set",
      "Photorealistic 3D renders of all rooms",
      "Real furniture, lighting & finishes selection",
      "Design supervision / contractor support"
    ],
    popular: true
  },
  {
    titleUa: "Пакет для США (Remote US)",
    titleEn: "US Remote Package",
    priceUa: 2500,
    priceUsd: 2500,
    priceEur: 2300,
    unitUa: "за кімнату / проєкт",
    unitEn: "per room / project",
    descUa: "Спеціалізований пакет для американського ринку з урахуванням норм США, підбором меблів з Wayfair/Amazon/Restoration Hardware.",
    descEn: "Specialized package for the US market adhering to local standards, US catalog sourcing.",
    featuresUa: [
      "Концепція та дизайн-борди (Moodboards)",
      "Повна специфікація з американських магазинів",
      "Фотореалістичні 3D рендери високої деталізації",
      "Пакети креслень для американських підрядників"
    ],
    featuresEn: [
      "Design concepts & moodboards",
      "Sourcing from US retailers (Wayfair, etc.)",
      "High-detail photorealistic 3D renders",
      "Drawings formatted for US contractors"
    ]
  }
];

export default function Services() {
  const { lang, currency } = useApp();

  // Проста логіка конвертації/відображення залежно від обраної валюти
  const formatPrice = (item: ServiceTier) => {
    if (currency === "USD") {
      return `$${item.priceUsd}`;
    } else if (currency === "EUR") {
      return `€${item.priceEur}`;
    } else {
      // Для UAH множимо умовно на курс або виводимо гривні (якщо вказано базово в USD, переведемо в грн приблизно по курсу 41)
      const uahVal = currency === "UAH" && item.priceUsd > 200 ? item.priceUsd * 41 : item.priceUa * 41;
      return `${uahVal.toLocaleString()} ₴`;
    }
  };

  return (
    <section id="services" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
        <div>
          <span className="text-xs font-light tracking-[0.3em] uppercase text-zinc-500 block mb-2">
            {lang === "UA" ? "Послуги та тарифи" : "Services & Pricing"}
          </span>
          <h2 className="text-3xl md:text-5xl font-extralight tracking-tight text-white">
            {lang === "UA" ? "Оберіть формат співпраці" : "Choose Your Package"}
          </h2>
        </div>
        <p className="text-xs font-light text-zinc-400 max-w-md mt-4 md:mt-0">
          {lang === "UA"
            ? "Прозоре ціноутворення для проєктів будь-якої складності в Україні, Європі та США."
            : "Transparent pricing for projects of any complexity in Ukraine, Europe, and the US."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {SERVICES.map((service, index) => (
          <div
            key={index}
            className={`relative bg-[#121214] p-8 border rounded-sm flex flex-col justify-between transition-all duration-500 hover:border-white/30 ${
              service.popular ? "border-white/20 bg-gradient-to-b from-[#18181b] to-[#121214]" : "border-white/5"
            }`}
          >
            {service.popular && (
              <span className="absolute -top-3 left-8 bg-white text-black text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full">
                {lang === "UA" ? "Популярний вибір" : "Most Popular"}
              </span>
            )}

            <div>
              <h3 className="text-xl font-light text-white mb-2">
                {lang === "UA" ? service.titleUa : service.titleEn}
              </h3>
              <p className="text-xs font-light text-zinc-400 mb-6 leading-relaxed">
                {lang === "UA" ? service.descUa : service.descEn}
              </p>

              <div className="mb-8 pb-6 border-b border-white/10">
                <div className="text-3xl md:text-4xl font-extralight font-mono text-white tracking-tight">
                  {formatPrice(service)}
                </div>
                <span className="text-xs text-zinc-500 font-mono mt-1 block">
                  {lang === "UA" ? service.unitUa : service.unitEn}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {(lang === "UA" ? service.featuresUa : service.featuresEn).map((feat, fIdx) => (
                  <li key={fIdx} className="text-xs font-light text-zinc-300 flex items-start gap-2">
                    <span className="text-white mt-0.5">•</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                const element = document.getElementById("calculator");
                element?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full py-4 text-xs font-mono uppercase tracking-widest border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 text-center"
            >
              {lang === "UA" ? "Розрахувати проєкт" : "Calculate Project"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}