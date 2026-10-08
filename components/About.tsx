"use client";

import { useApp } from "@/context/AppContext";

export default function About() {
  const { lang } = useApp();

  return (
    <section id="about" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 scroll-mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Заголовок та підзаголовок */}
        <div className="lg:col-span-5">
          <span className="text-xs font-light tracking-[0.3em] uppercase text-zinc-500 block mb-2">
            {lang === "UA" ? "Про студію" : "About Studio"}
          </span>
          <h2 className="text-3xl md:text-5xl font-extralight tracking-tight text-white mb-6">
            {lang === "UA" 
              ? "Архітектура простору та цифрова естетика" 
              : "Spatial Architecture & Digital Aesthetics"}
          </h2>
          <p className="text-xs font-light text-zinc-400 leading-relaxed">
            {lang === "UA"
              ? "Ми створюємо візуалізації, які передають атмосферу, матеріальність та характер майбутнього інтер'єру ще до початку будівельних робіт."
              : "We create visualizations that convey the atmosphere, materiality, and character of the future interior even before construction begins."}
          </p>
        </div>

        {/* Основний текст та факти */}
        <div className="lg:col-span-7 bg-[#121214] p-8 md:p-12 border border-white/5 rounded-sm flex flex-col gap-8">
          <div className="space-y-4 text-xs font-light text-zinc-300 leading-relaxed">
            <p>
              {lang === "UA"
                ? "Наша студія спеціалізується на високоякісній 3D-візуалізації інтер'єрів та екстер'єрів. Ми працюємо на перетині сучасного дизайну, точних технологій моделювання та фотореалістичного рендерингу (3ds Max, Corona Renderer, Unreal Engine)."
                : "Our studio specializes in high-end 3D interior and exterior visualization. We work at the intersection of modern design, precise modeling technologies, and photorealistic rendering (3ds Max, Corona Renderer, Unreal Engine)."}
            </p>
            <p>
              {lang === "UA"
                ? "Ми допомагаємо дизайнерам, архітекторам та девелоперам втілювати ідеї у візуальний простір, який продає проєкт на етапі презентації."
                : "We help designers, architects, and developers turn ideas into visual spaces that sell the project right at the presentation stage."}
            </p>
          </div>

          {/* Цифри / Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-white/10 font-mono">
            <div>
              <span className="text-2xl md:text-3xl font-extralight text-white block mb-1">5+</span>
              <span className="text-[10px] uppercase text-zinc-500 tracking-wider">
                {lang === "UA" ? "Років досвіду" : "Years Experience"}
              </span>
            </div>
            <div>
              <span className="text-2xl md:text-3xl font-extralight text-white block mb-1">150+</span>
              <span className="text-[10px] uppercase text-zinc-500 tracking-wider">
                {lang === "UA" ? "Проєктів" : "Projects Done"}
              </span>
            </div>
            <div>
              <span className="text-2xl md:text-3xl font-extralight text-white block mb-1">Global</span>
              <span className="text-[10px] uppercase text-zinc-500 tracking-wider">
                {lang === "UA" ? "Віддалена робота" : "Remote Reach"}
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}