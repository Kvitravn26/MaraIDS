"use client";

import { useApp } from "@/context/AppContext";
import Link from "next/link";

export default function Hero() {
  const { lang } = useApp();

  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden pt-28 pb-16 px-6">
      {/* Фонове зображення */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1920&auto=format&fit=crop')`,
          filter: "brightness(0.35)"
        }}
      />

      {/* Градієнтне затемнення зверху та знизу для плавного переходу */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b]/80 via-transparent to-[#0a0a0b] pointer-events-none" />

      {/* Головний контент */}
      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center gap-6">
        <span className="text-xs font-light tracking-[0.4em] uppercase text-zinc-300">
          {lang === "UA" 
            ? "Студія архітектурного дизайну & 3D-візуалізації" 
            : "Architectural Design & 3D Visualization Studio"}
        </span>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extralight tracking-tight text-white leading-[1.15]">
          {lang === "UA" ? (
            <>
              Втілюємо <span className="font-normal italic text-zinc-300">простір</span>, який надихає
            </>
          ) : (
            <>
              Crafting <span className="font-normal italic text-zinc-300">spaces</span> that inspire
            </>
          )}
        </h1>

        <p className="text-sm md:text-base font-light text-zinc-300 max-w-2xl leading-relaxed">
          {lang === "UA"
            ? "Створюємо фотореалістичні 3D-візуалізації та продумані інтер'єри для приватних і комерційних об'єктів."
            : "Creating photorealistic 3D visualizations and thoughtful interiors for private and commercial spaces."}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <Link
            href="#calculator"
            className="px-8 py-3.5 bg-white text-black text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 hover:bg-zinc-200 cursor-pointer"
          >
            {lang === "UA" ? "Розрахувати вартість" : "Calculate Cost"}
          </Link>
          <Link
            href="#projects"
            className="px-8 py-3.5 border border-white/30 text-zinc-200 text-xs font-light tracking-[0.2em] uppercase transition-all duration-300 hover:border-white hover:text-white bg-black/30 backdrop-blur-sm cursor-pointer"
          >
            {lang === "UA" ? "Переглянути проєкти" : "View Portfolio"}
          </Link>
        </div>
      </div>
    </section>
  );
}