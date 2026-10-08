"use client";

import { useApp } from "@/context/AppContext";

export default function Header() {
  const { lang, setLang } = useApp();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Логотип */}
        <a href="#" className="text-sm font-light tracking-[0.25em] uppercase text-white">
          Mara <span className="text-zinc-500">Studio</span>
        </a>

        {/* Навігація */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-light tracking-widest text-zinc-400 uppercase">
          <a href="#projects" className="hover:text-white transition-colors">
            {lang === "UA" ? "Проєкти" : "Projects"}
          </a>
          <a href="#services" className="hover:text-white transition-colors">
            {lang === "UA" ? "Послуги" : "Services"}
          </a>
          <a href="#about" className="hover:text-white transition-colors">
            {lang === "UA" ? "Про студію" : "About"}
          </a>
          <a href="#calculator" className="hover:text-white transition-colors">
            {lang === "UA" ? "Калькулятор" : "Calculator"}
          </a>
          <a href="#contact" className="hover:text-white transition-colors">
            {lang === "UA" ? "Контакти" : "Contact"}
          </a>
        </nav>

        {/* Перемикач мови */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <button
            onClick={() => setLang("UA")}
            className={`cursor-pointer transition-colors ${
              lang === "UA" ? "text-white font-medium" : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            UA
          </button>
          <span className="text-zinc-700">/</span>
          <button
            onClick={() => setLang("EN")}
            className={`cursor-pointer transition-colors ${
              lang === "EN" ? "text-white font-medium" : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            EN
          </button>
        </div>

      </div>
    </header>
  );
}