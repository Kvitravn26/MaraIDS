"use client";

import { useApp } from "@/context/AppContext";

export default function About() {
  const { lang } = useApp();

  return (
    <section id="about" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Заголовок та основна ідея */}
        <div className="lg:col-span-6">
          <span className="text-xs font-light tracking-[0.3em] uppercase text-zinc-500 block mb-2">
            {lang === "UA" ? "Про студію" : "About Studio"}
          </span>
          <h2 className="text-3xl md:text-5xl font-extralight tracking-tight text-white mb-6 leading-tight">
            {lang === "UA"
              ? "Ми створюємо простір, який відображає ваш характер."
              : "We craft spaces that reflect your unique character."}
          </h2>
          <p className="text-xs font-light text-zinc-400 leading-relaxed mb-6">
            {lang === "UA"
              ? "Mara Design Studio — це професійна студія 3D-візуалізації та дизайну інтер'єрів. Ми поєднуємо естетику сучасного мінімалізму, функціональність та фотореалістичну точність у кожному проєкті."
              : "Mara Design Studio is a professional 3D visualization and interior design studio. We combine modern minimalist aesthetics, functionality, and photorealistic precision in every project."}
          </p>
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10 font-mono text-xs">
            <div>
              <span className="text-2xl font-light text-white block mb-1">2021</span>
              <span className="text-zinc-500 uppercase tracking-widest text-[10px]">
                {lang === "UA" ? "Рік заснування" : "Established"}
              </span>
            </div>
            <div>
              <span className="text-2xl font-light text-white block mb-1">150+</span>
              <span className="text-zinc-500 uppercase tracking-widest text-[10px]">
                {lang === "UA" ? "Реалізованих проєктів" : "Completed Projects"}
              </span>
            </div>
          </div>
        </div>

        {/* Філософія / Картки переваг */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="bg-[#121214] p-8 border border-white/5 rounded-sm">
            <h3 className="text-sm font-medium uppercase tracking-widest text-white mb-2 font-mono">
              01 // {lang === "UA" ? "Фотореалістичність" : "Photorealism"}
            </h3>
            <p className="text-xs font-light text-zinc-400 leading-relaxed">
              {lang === "UA"
                ? "Використання сучасного софту (3ds Max, Corona Renderer) та складних PBR-текстур дозволяє побачити майбутній інтер'єр із точністю до реального фото."
                : "Using advanced software (3ds Max, Corona Renderer) and complex PBR textures allows you to preview the future interior with photographic precision."}
            </p>
          </div>

          <div className="bg-[#121214] p-8 border border-white/5 rounded-sm">
            <h3 className="text-sm font-medium uppercase tracking-widest text-white mb-2 font-mono">
              02 // {lang === "UA" ? "Ергономіка та Комфорт" : "Ergonomics & Comfort"}
            </h3>
            <p className="text-xs font-light text-zinc-400 leading-relaxed">
              {lang === "UA"
                ? "Кожен сантиметр простору проєктується з урахуванням вашого способу життя, зручності рухів та логіки приміщення."
                : "Every centimeter of space is engineered considering your lifestyle, movement flows, and room logic."}
            </p>
          </div>

          <div className="bg-[#121214] p-8 border border-white/5 rounded-sm">
            <h3 className="text-sm font-medium uppercase tracking-widest text-white mb-2 font-mono">
              03 // {lang === "UA" ? "Глобальний підхід" : "Global Approach"}
            </h3>
            <p className="text-xs font-light text-zinc-400 leading-relaxed">
              {lang === "UA"
                ? "Працюємо з клієнтами та підрядниками з України, Європи та США, адаптуючи документацію під локальні стандарти."
                : "We work with clients and contractors from Ukraine, Europe, and the US, adapting documentation to local standards."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}