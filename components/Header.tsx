"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useApp, Language, Currency } from "@/context/AppContext";

export default function Header() {
  const { lang, setLang, currency, setCurrency } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#0a0a0b]/90 backdrop-blur-md border-b border-white/5 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Логотип */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-[36px] h-[36px] relative flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Mara Design Studio"
              width={36}
              height={36}
              className="object-contain w-full h-full"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-light tracking-[0.3em] uppercase text-zinc-100 group-hover:text-white transition">
              MARA
            </span>
            <span className="text-[9px] font-extralight tracking-[0.2em] text-zinc-500 uppercase">
              DESIGN STUDIO
            </span>
          </div>
        </Link>

        {/* Навігаційне меню */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-light tracking-[0.2em] uppercase text-zinc-400">
          <Link href="#projects" className="hover:text-white transition-colors duration-200">
            {lang === "UA" ? "Проєкти" : "Projects"}
          </Link>
          <Link href="#services" className="hover:text-white transition-colors duration-200">
            {lang === "UA" ? "Послуги" : "Services"}
          </Link>
          <Link href="#studio" className="hover:text-white transition-colors duration-200">
            {lang === "UA" ? "Про студію" : "Studio"}
          </Link>
          <Link href="#calculator" className="hover:text-white transition-colors duration-200">
            {lang === "UA" ? "Калькулятор" : "Calculator"}
          </Link>
          <Link href="#contact" className="hover:text-white transition-colors duration-200">
            {lang === "UA" ? "Контакти" : "Contact"}
          </Link>
        </nav>

        {/* Перемикачі Мови та Валюти */}
        <div className="flex items-center gap-6 text-[11px] font-light tracking-wider">
          
          {/* Перемикач мов (UA / EN) */}
          <div className="flex items-center gap-2 text-zinc-500">
            {(["UA", "EN"] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`transition-colors duration-200 cursor-pointer ${
                  lang === l
                    ? "text-zinc-100 font-normal underline underline-offset-4"
                    : "hover:text-zinc-300"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="h-3 w-[1px] bg-white/10 hidden sm:block" />

          {/* Перемикач валют (UAH / USD / EUR) */}
          <div className="hidden sm:flex items-center gap-2 text-zinc-500">
            {(["UAH", "USD", "EUR"] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`transition-colors duration-200 cursor-pointer ${
                  currency === c
                    ? "text-zinc-100 font-normal underline underline-offset-4"
                    : "hover:text-zinc-300"
                }`}
              >
                {c === "UAH" ? "₴ UAH" : c === "USD" ? "$ USD" : "€ EUR"}
              </button>
            ))}
          </div>

          {/* Гамбургер-кнопка для мобільних */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-zinc-400 hover:text-white p-1 cursor-pointer"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Мобільне меню */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/5 flex flex-col gap-4 text-xs font-light tracking-[0.2em] uppercase text-zinc-400">
          <Link href="#projects" onClick={() => setIsMenuOpen(false)} className="hover:text-white">
            {lang === "UA" ? "Проєкти" : "Projects"}
          </Link>
          <Link href="#services" onClick={() => setIsMenuOpen(false)} className="hover:text-white">
            {lang === "UA" ? "Послуги" : "Services"}
          </Link>
          <Link href="#studio" onClick={() => setIsMenuOpen(false)} className="hover:text-white">
            {lang === "UA" ? "Про студію" : "Studio"}
          </Link>
          <Link href="#calculator" onClick={() => setIsMenuOpen(false)} className="hover:text-white">
            {lang === "UA" ? "Калькулятор" : "Calculator"}
          </Link>
          <Link href="#contact" onClick={() => setIsMenuOpen(false)} className="hover:text-white">
            {lang === "UA" ? "Контакти" : "Contact"}
          </Link>

          <div className="flex gap-4 pt-2 border-t border-white/5 text-zinc-500">
            {(["UAH", "USD", "EUR"] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={currency === c ? "text-white underline underline-offset-4" : ""}
              >
                {c === "UAH" ? "₴ UAH" : c === "USD" ? "$ USD" : "€ EUR"}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}