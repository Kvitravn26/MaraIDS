"use client";

import { useApp } from "@/context/AppContext";

export default function Footer() {
  const { lang } = useApp();

  return (
    <footer className="border-t border-white/5 py-12 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-light text-zinc-500">
      <div className="flex items-center gap-2">
        <span className="font-medium tracking-widest text-white uppercase text-sm">MARA</span>
        <span className="text-zinc-600">/</span>
        <span>Design Studio</span>
      </div>

      <div className="flex items-center gap-6 font-mono text-[11px]">
        <a href="#projects" className="hover:text-white transition-colors">
          {lang === "UA" ? "Проєкти" : "Projects"}
        </a>
        <a href="#services" className="hover:text-white transition-colors">
          {lang === "UA" ? "Послуги" : "Services"}
        </a>
        <a href="#calculator" className="hover:text-white transition-colors">
          {lang === "UA" ? "Калькулятор" : "Calculator"}
        </a>
        <a href="#contact" className="hover:text-white transition-colors">
          {lang === "UA" ? "Контакти" : "Contact"}
        </a>
      </div>

      <div className="text-[11px] font-mono text-zinc-600">
        © {new Date().getFullYear()} Mara Design Studio. All rights reserved.
      </div>
    </footer>
  );
}