"use client";

import { useApp } from "@/context/AppContext";

export default function About() {
  const { lang } = useApp();

  return (
    <section id="about" className="mx-auto max-w-[1600px] scroll-mt-24 border-t border-[#e4e0d5] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left Column: Heading */}
        <div className="lg:col-span-5">
          <span className="mb-4 block text-[11px] font-medium uppercase tracking-[0.2em] text-[#6e6c64]">
            {lang === "UA" ? "Про студію · Філософія" : "About Studio · Philosophy"}
          </span>
          <h2 className="mb-6 font-serif text-3xl font-normal leading-[1.12] text-[#1c1b18] sm:text-4xl lg:text-5xl">
            {lang === "UA"
              ? "Архітектурна стриманість, природне світло та тепло матеріалів"
              : "Architectural restraint, natural light, and the warmth of materials"}
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-[#6e6c64]">
            {lang === "UA"
              ? "Ми створюємо 3D-візуалізації та дизайн-концепції, де кожен матеріал — камінь, дуб, льон, метал — відчувається так само живо, як і в реальному просторі."
              : "We create 3D visualizations and spatial designs where every texture — limestone, oak, linen, patinated metal — feels as tangible as in real life."}
          </p>
        </div>

        {/* Right Column: Narrative & Stats */}
        <div className="flex flex-col gap-10 border-y border-[#e4e0d5] py-8 lg:col-span-7 lg:py-10">
          <div className="space-y-5 text-sm leading-[1.8] text-[#4a4943] sm:text-base">
            <p>
              {lang === "UA"
                ? "Mara Design Studio працює на перетині сучасної архітектури, точного просторового моделювання та високохудожнього фотореалістичного рендерингу (3ds Max, Corona, Unreal Engine). Наш підхід базується на балансі чистих ліній та комфорту для життя."
                : "Mara Design Studio operates at the intersection of contemporary architecture, precise spatial modeling, and photorealistic CGI (3ds Max, Corona, Unreal Engine). Our approach balances architectural clarity with everyday livability."}
            </p>
            <p>
              {lang === "UA"
                ? "Ми співпрацюємо з девелоперами, архітектурними бюро та приватними замовниками по всьому світу, перетворюючи концептуальні креслення на візуальний досвід найвищого рівня."
                : "We collaborate with developers, architectural firms, and private clients worldwide, turning architectural blueprints into an evocative, immersive visual experience."}
            </p>
          </div>

          {/* Key Figures */}
          <div className="grid grid-cols-3 gap-6 border-t border-[#e4e0d5] pt-8">
            <div>
              <span className="block font-serif text-3xl font-normal text-[#1c1b18] sm:text-4xl">5+</span>
              <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#8f8c82]">
                {lang === "UA" ? "Років практики" : "Years Experience"}
              </span>
            </div>
            <div>
              <span className="block font-serif text-3xl font-normal text-[#1c1b18] sm:text-4xl">150+</span>
              <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#8f8c82]">
                {lang === "UA" ? "Реалізованих кейсів" : "Completed Projects"}
              </span>
            </div>
            <div>
              <span className="block font-serif text-3xl font-normal text-[#1c1b18] sm:text-4xl">Global</span>
              <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#8f8c82]">
                {lang === "UA" ? "Міжнародний досвід" : "Worldwide Remote"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}