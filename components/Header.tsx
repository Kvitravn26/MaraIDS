"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function Header() {
  const { lang, setLang, currency, setCurrency } = useApp();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Логотип та назва (клік повертає на початок сторінки) */}
        <Link 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-3.5 group cursor-pointer"
        >
          <img 
            src="/logo.png" 
            alt="Mara Design Studio Logo" 
            className="h-21 w-auto object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity" 
          />
        </Link>

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

        {/* Правий блок: Перемикач валют та мови */}
        <div className="flex items-center gap-6">
          
          {/* Перемикач валют */}
          <div className="flex items-center gap-2 text-xs font-mono">
            {(["UAH", "USD", "EUR"] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`cursor-pointer transition-colors px-1.5 py-0.5 ${
                  currency === curr ? "text-white font-medium bg-white/10" : "text-zinc-600 hover:text-zinc-400"
                }`}
              >
                {curr === "UAH" ? "₴" : curr === "USD" ? "$" : "€"}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-zinc-800"></div>

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

      </div>
    </header>
  );
}