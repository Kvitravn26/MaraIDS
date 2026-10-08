"use client";

import { useApp } from "@/context/AppContext";

interface WorkflowStep {
  step: string;
  titleUa: string;
  titleEn: string;
  descUa: string;
  descEn: string;
}

const STEPS: WorkflowStep[] = [
  {
    step: "01",
    titleUa: "Брифінг та технічне завдання",
    titleEn: "Briefing & Requirements",
    descUa: "Обговорюємо ваші побажання, стиль, функціональні вимоги та бюджети майбутнього простору.",
    descEn: "We discuss your preferences, style, functional requirements, and project budget.",
  },
  {
    step: "02",
    titleUa: "Концепція та планування",
    titleEn: "Concept & Space Planning",
    descUa: "Розробляємо планувальні рішення та мудборди для затвердження загального настрою.",
    descEn: "We develop floor plan layouts and mood boards to establish the overall design mood.",
  },
  {
    step: "03",
    titleUa: "3D-візуалізація та деталізація",
    titleEn: "3D Visualization & Detailing",
    descUa: "Створюємо фотореалістичні 3D-рендери в 3ds Max та Corona Renderer з точним підбором матеріалів.",
    descEn: "We craft photorealistic 3D renders using 3ds Max and Corona Renderer with precise material selection.",
  },
  {
    step: "04",
    titleUa: "Фінальний результат",
    titleEn: "Final Delivery",
    descUa: "Ви отримуєте повний пакет візуалізацій, креслень та специфікацій для реалізації проєкту.",
    descEn: "You receive a complete package of high-res renders, technical drawings, and material specs.",
  },
];

export default function Workflow() {
  const { lang } = useApp();

  return (
    <section id="workflow" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="mb-16">
        <span className="text-xs font-light tracking-[0.3em] uppercase text-zinc-500 block mb-2">
          {lang === "UA" ? "Етапи співпраці" : "Workflow Process"}
        </span>
        <h2 className="text-3xl md:text-5xl font-extralight tracking-tight text-white">
          {lang === "UA" ? "Як ми створюємо проєкт" : "How We Build Your Project"}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {STEPS.map((item, index) => (
          <div
            key={index}
            className="group relative bg-[#121214] p-8 border border-white/5 rounded-sm transition-all duration-500 hover:border-white/20 flex flex-col justify-between"
          >
            <div>
              <div className="text-4xl font-extralight font-mono text-zinc-600 mb-6 group-hover:text-white transition-colors">
                {item.step}
              </div>
              <h3 className="text-lg font-light text-white tracking-wide mb-3">
                {lang === "UA" ? item.titleUa : item.titleEn}
              </h3>
              <p className="text-xs font-light text-zinc-400 leading-relaxed">
                {lang === "UA" ? item.descUa : item.descEn}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>Mara Design Studio</span>
              <span>Step {item.step}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}