"use client";

import { useState } from "react";
import Image from "next/image";
import { useApp } from "@/context/AppContext";

type Category = "all" | "residential" | "commercial" | "architecture";

interface ProjectItem {
  id: string;
  titleUa: string;
  titleEn: string;
  category: Category;
  categoryUa: string;
  categoryEn: string;
  image: string;
  area: string;
  year: string;
}

const PROJECTS_DATA: ProjectItem[] = [
  {
    id: "1",
    titleUa: "Апартаменти в ПАР",
    titleEn: "Apartments in South Africa",
    category: "interior",
    categoryUa: "Дизайн інтер'єру",
    categoryEn: "Interior Design",
    image: "https://lh3.googleusercontent.com/d/15nLUpRboTs-jHjgpHleAhVbeb8efJ-5o",
    area: "80 m²",
    year: "2025",
  },
  {
    id: "2",
    titleUa: "Сучасний пентхаус у центрі",
    titleEn: "Modern Downtown Penthouse",
    category: "residential",
    categoryUa: "Житлові інтер'єри",
    categoryEn: "Residential interiors",
    image: "https://drive.google.com/file/d/15nLUpRboTs-jHjgpHleAhVbeb8efJ-5o/view?usp=drive_link",
    area: "180 m²",
    year: "2025",
  },
  {
    id: "3",
    titleUa: "Концептуальний ресторан & бар",
    titleEn: "Conceptual Restaurant & Lounge",
    category: "commercial",
    categoryUa: "Комерційні об'єкти",
    categoryEn: "Commercial Spaces",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop",
    area: "450 m²",
    year: "2026",
  },
  {
    id: "4",
    titleUa: "Приватний резиденс із басейном",
    titleEn: "Private Villa with Pool",
    category: "architecture",
    categoryUa: "Архітектура",
    categoryEn: "Architecture",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
    area: "520 m²",
    year: "2025",
  },
  {
    id: "5",
    titleUa: "Скандинавський апартамент",
    titleEn: "Scandinavian Apartment Interior",
    category: "residential",
    categoryUa: "Житлові інтер'єри",
    categoryEn: "Residential interiors",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
    area: "95 m²",
    year: "2026",
  },
  {
    id: "6",
    titleUa: "Tech-офіс преміум класу",
    titleEn: "Premium Tech HQ Office",
    category: "commercial",
    categoryUa: "Комерційні об'єкти",
    categoryEn: "Commercial Spaces",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop",
    area: "800 m²",
    year: "2025",
  },
];

export default function Projects() {
  const { lang } = useApp();
  const [activeTab, setActiveTab] = useState<Category>("all");

  const filteredProjects = activeTab === "all"
    ? PROJECTS_DATA
    : PROJECTS_DATA.filter((item) => item.category === activeTab);

  return (
    <section id="projects" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
      {/* Заголовок секції */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-xs font-light tracking-[0.3em] uppercase text-zinc-500 block mb-2">
            {lang === "UA" ? "Портфоліо" : "Portfolio"}
          </span>
          <h2 className="text-3xl md:text-5xl font-extralight tracking-tight text-white">
            {lang === "UA" ? "Обрані проєкти" : "Selected Works"}
          </h2>
        </div>

        {/* Таби / Фільтри категорій */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-light tracking-wider">
          {[
            { id: "all", ua: "Всі", en: "All" },
            { id: "residential", ua: "Житлові", en: "Residential" },
            { id: "commercial", ua: "Комерційні", en: "Commercial" },
            { id: "architecture", ua: "Архітектура", en: "Architecture" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Category)}
              className={`px-4 py-2 transition-all duration-300 rounded-full border cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-black border-white font-normal"
                  : "bg-transparent text-zinc-400 border-white/10 hover:border-white/30 hover:text-white"
              }`}
            >
              {lang === "UA" ? tab.ua : tab.en}
            </button>
          ))}
        </div>
      </div>

      {/* Сітка проєктів */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="group relative bg-[#121214] border border-white/5 overflow-hidden rounded-sm transition-all duration-500 hover:border-white/20"
          >
            {/* Картинка з ховер-ефектом */}
            <div className="relative w-full h-[320px] overflow-hidden">
            <Image
  src={project.image}
  alt={lang === "UA" ? project.titleUa : project.titleEn}
  fill
  unoptimized // <-- Додаємо цей рядок
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-contain transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-[0.85] group-hover:brightness-100"
/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-transparent opacity-80" />
            </div>

            {/* Опис проєкту */}
            <div className="p-6 relative z-10 flex flex-col justify-between -mt-12 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/90 to-transparent">
              <div className="flex items-center justify-between text-[10px] font-light tracking-[0.2em] uppercase text-zinc-400 mb-2">
                <span>{lang === "UA" ? project.categoryUa : project.categoryEn}</span>
                <span>{project.year}</span>
              </div>

              <h3 className="text-lg font-light text-white tracking-wide mb-4 group-hover:text-zinc-200 transition-colors">
                {lang === "UA" ? project.titleUa : project.titleEn}
              </h3>

              <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs font-extralight text-zinc-400">
                <span>{lang === "UA" ? `Площа: ${project.area}` : `Area: ${project.area}`}</span>
                <span className="group-hover:translate-x-1 transition-transform duration-300 text-white">
                  →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}