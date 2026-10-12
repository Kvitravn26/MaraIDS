"use client";

import { useApp } from "@/context/AppContext";

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
    titleUa: "3D-Візуалізація (Базовий)",
    titleEn: "3D Visualization (Basic)",
    priceUa: 622,
    priceUsd: 15,
    priceEur: 14,
    unitUa: "за м²",
    unitEn: "per sq m",
    descUa: "Фотореалістичні рендери за вашим готовим дизайн-проєктом або планом приміщення.",
    descEn: "Photorealistic renders based on your ready design project or architectural plan.",
    featuresUa: [
      "Точне 3D-моделювання геометрії",
      "Налаштування природного та штучного світла",
      "PBR-текстури високої роздільності",
      "До 2 кіл правок на приміщення"
    ],
    featuresEn: [
      "Accurate 3D geometry modeling",
      "Natural and artificial lighting setup",
      "High-resolution PBR textures",
      "Up to 2 revision rounds per space"
    ]
  },
  {
    titleUa: "Дизайн & Преміум CGI",
    titleEn: "Full Interior Design & CGI",
    priceUa: 1037,
    priceUsd: 25,
    priceEur: 23,
    unitUa: "за м²",
    unitEn: "per sq m",
    descUa: "Повний дизайн-проєкт: планування, підбір матеріалів, меблів та 4K фотореалістичний рендеринг.",
    descEn: "Comprehensive design: space planning, finishes & furniture selection, 4K rendering.",
    featuresUa: [
      "2-3 варіанти планувального рішення",
      "Підбір реальних оздоблювальних матеріалів",
      "Фотореалістичні 4K-рендери всіх кімнат",
      "VR 360° інтерактивна панорама"
    ],
    featuresEn: [
      "2-3 space planning alternatives",
      "Real furniture and material specification",
      "Photorealistic 4K renders of all rooms",
      "VR 360° interactive tour"
    ],
    popular: true
  },
  {
    titleUa: "Комплексний Архітектурний Пакет",
    titleEn: "Turnkey Architectural Package",
    priceUa: 1452,
    priceUsd: 35,
    priceEur: 32,
    unitUa: "за м²",
    unitEn: "per sq m",
    descUa: "Повний пакет креслень, авторський супровід, специфікації та 3D-анімація простору.",
    descEn: "Full construction documentation, designer supervision, schedules, and 3D walkthrough.",
    featuresUa: [
      "Повний робочий пакет креслень для будівельників",
      "Відеоанімація прольоту камери",
      "Специфікація меблів, освітлення та сантехніки",
      "Персональний супровід у кабінеті проєкту"
    ],
    featuresEn: [
      "Contractor-ready working blueprints",
      "Cinematic 3D video walkthrough",
      "Itemized furniture, lighting & fixture schedule",
      "Dedicated portal support throughout"
    ]
  }
];

export default function Services() {
  const { lang, currency, formatPrice } = useApp();

  const getServicePriceDisplay = (item: ServiceTier) => {
    return `${formatPrice(item.priceUa)} ${lang === "UA" ? item.unitUa : item.unitEn}`;
  };

  return (
    <section id="services-packages" className="py-24 px-5 sm:px-8 lg:px-12 max-w-[1600px] mx-auto border-t border-[#e4e0d5]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
        <div>
          <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#6e6c64] block mb-2">
            {lang === "UA" ? "Пакети послуг та вартість" : "Service Packages & Pricing"}
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-normal text-[#1c1b18]">
            {lang === "UA" ? "Формати співпраці" : "Collaboration Packages"}
          </h2>
        </div>
        <p className="text-xs text-[#6e6c64] max-w-md mt-4 md:mt-0 leading-relaxed">
          {lang === "UA"
            ? "Прозоре ціноутворення без прихованих платежів з фіксованими термінами виконання."
            : "Transparent pricing with no hidden fees and guaranteed project milestones."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {SERVICES.map((service, index) => (
          <div
            key={index}
            className={`relative p-8 rounded-sm border flex flex-col justify-between transition-all duration-300 ${
              service.popular
                ? "border-[#1c1b18] bg-white shadow-md ring-1 ring-[#1c1b18]"
                : "border-[#e4e0d5] bg-white hover:border-[#1c1b18]/40 shadow-xs"
            }`}
          >
            {service.popular && (
              <span className="absolute -top-3 left-8 bg-[#1c1b18] text-white text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-xs">
                {lang === "UA" ? "Вибір більшості" : "Most Popular"}
              </span>
            )}

            <div>
              <h3 className="font-serif text-2xl font-normal text-[#1c1b18] mb-2">
                {lang === "UA" ? service.titleUa : service.titleEn}
              </h3>
              <p className="text-xs text-[#6e6c64] mb-6 leading-relaxed">
                {lang === "UA" ? service.descUa : service.descEn}
              </p>

              <div className="mb-8 pb-6 border-b border-[#e4e0d5]">
                <div className="text-3xl font-serif text-[#1c1b18] tracking-tight">
                  {getServicePriceDisplay(service)}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {(lang === "UA" ? service.featuresUa : service.featuresEn).map((feat, fIdx) => (
                  <li key={fIdx} className="text-xs text-[#4a4943] flex items-start gap-2.5">
                    <span className="text-[#1c1b18] font-bold">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <a
              href="#calculator"
              className={`w-full py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-center rounded-sm transition-colors ${
                service.popular
                  ? "bg-[#1c1b18] text-white hover:bg-[#33312c]"
                  : "border border-[#1c1b18] text-[#1c1b18] hover:bg-[#1c1b18] hover:text-white"
              }`}
            >
              {lang === "UA" ? "Розрахувати вартість" : "Calculate Space"}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}