"use client";

import { useApp } from "@/context/AppContext";
import Link from "next/link";

export default function Footer() {
  const { lang } = useApp();

  return (
    <footer className="border-t border-[#e4e0d5] bg-[#f4f0e8] px-5 pb-12 pt-16 text-[#6e6c64] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          {/* Studio Brand */}
          <div className="lg:col-span-5">
            <span className="block font-serif text-2xl font-normal tracking-wide text-[#1c1b18]">
              MARA
            </span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.24em] text-[#8f8c82]">
              Design & Visualization Studio
            </span>
            <p className="mt-5 max-w-sm text-xs leading-relaxed text-[#6e6c64]">
              {lang === "UA"
                ? "Архітектурна візуалізація та просторовий дизайн. Стриманість, світло та увага до матеріалу."
                : "Architectural visualization and spatial design. Restraint, natural light, and considered materials."}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3 text-xs sm:col-span-1 lg:col-span-3">
            <span className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#8f8c82]">
              {lang === "UA" ? "Навігація" : "Navigation"}
            </span>
            <Link href="#projects" className="w-fit transition-colors hover:text-[#1c1b18]">
              {lang === "UA" ? "Проєкти" : "Projects"}
            </Link>
            <Link href="#services" className="w-fit transition-colors hover:text-[#1c1b18]">
              {lang === "UA" ? "Послуги & Процес" : "Services & Process"}
            </Link>
            <Link href="#calculator" className="w-fit transition-colors hover:text-[#1c1b18]">
              {lang === "UA" ? "Калькулятор" : "Calculator"}
            </Link>
            <Link href="#about" className="w-fit transition-colors hover:text-[#1c1b18]">
              {lang === "UA" ? "Про студію" : "About Studio"}
            </Link>
            <Link href="#contact" className="w-fit transition-colors hover:text-[#1c1b18]">
              {lang === "UA" ? "Контакти" : "Contact"}
            </Link>
          </div>

          {/* Studio Info */}
          <div className="flex flex-col gap-3 text-xs lg:col-span-4">
            <span className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#8f8c82]">
              {lang === "UA" ? "Зв'язок" : "Inquiries"}
            </span>
            <a
              href="mailto:maradesigninterior@gmail.com"
              className="w-fit text-[#1c1b18] transition-colors hover:underline"
            >
              maradesigninterior@gmail.com
            </a>
            <span>Kyiv, Ukraine · Remote Worldwide</span>
            <span className="text-[11px] text-[#8f8c82]">
              Mon — Fri, 10:00 — 19:00 (EET)
            </span>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="flex flex-col gap-3 border-t border-[#e4e0d5] pt-6 text-[11px] text-[#8f8c82] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2025—2026 Mara Design Studio. All rights reserved.</span>
          <span>
            {lang === "UA"
              ? "Створено з увагою до простору та світла"
              : "Conceived with clarity and light"}
          </span>
        </div>
      </div>
    </footer>
  );
}