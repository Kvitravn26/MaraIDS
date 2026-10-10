"use client";

import { useState, useRef } from "react";
import Header from "@/components/Header";
import About from "@/components/About";
import Calculator from "@/components/PriceCalculator";
import Contact from "@/components/Contact";
import ProjectModal, { Project } from "@/components/ProjectModal";
import { useApp } from "@/context/AppContext";

const PROJECTS: Project[] = [
  {
    id: "penthouse-modernism",
    titleUa: "Penthouse Modernism",
    titleEn: "Penthouse Modernism",
    categoryUa: "Інтер'єр 3D",
    categoryEn: "Interior 3D",
    year: "2025",
    area: "180 м²",
    styleUa: "Сучасний мінімализм",
    styleEn: "Modern Minimalism",
    clientUa: "Приватний замовник",
    clientEn: "Private Client",
    descriptionUa: "Просторі апартаменти у центрі міста з використанням натурального дерева, бетону та мінімалістичних меблів. Особливу увагу приділено сценаріям світла та текстурам високої деталізації (PBR).",
    descriptionEn: "Spacious downtown apartment featuring natural wood, exposed concrete, and minimalist furniture. Special attention was paid to lighting scenarios and high-detail PBR textures.",
    mainImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop"
    ]
  },
  {
    id: "minimalist-office",
    titleUa: "Офісний простір у мінімалізмі",
    titleEn: "Minimalist Office Space",
    categoryUa: "Комерційний",
    categoryEn: "Commercial",
    year: "2026",
    area: "320 м²",
    styleUa: "Корпоративний контемпорарі",
    styleEn: "Corporate Contemporary",
    clientUa: "IT-компанія 'TechPulse'",
    clientEn: "TechPulse Inc.",
    descriptionUa: "Функціональний офіс open-space з лаунж-зонами, переговорними та акцентними світловими лініями. Створено повну атмосферу продуктивності та преміального стилю.",
    descriptionEn: "Functional open-space office with lounge areas, meeting rooms, and accent lighting lines. Designed for maximum productivity and premium aesthetics.",
    mainImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000&auto=format&fit=crop"
    ]
  },
  {
    id: "alpine-chalet",
    titleUa: "Альпійський Шале",
    titleEn: "Alpine Chalet",
    categoryUa: "Екстер'єр / Інтер'єр",
    categoryEn: "Exterior / Interior",
    year: "2025",
    area: "240 м²",
    styleUa: "Шале / Еко-стиль",
    styleEn: "Chalet / Eco Style",
    clientUa: "Приватний замовник",
    clientEn: "Private Client",
    descriptionUa: "Затишний гірський будинок із панорамним склінням, каміном на дровах та теплим текстилем. Візуалізація передає вечірнє затишне світло та текстуру каменя.",
    descriptionEn: "Cozy mountain house with panoramic glazing, wood-burning fireplace, and warm textiles. Visualization captures warm evening lighting and stone textures.",
    mainImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1000&auto=format&fit=crop"
    ]
  },
  {
    id: "scandi-apartment",
    titleUa: "Скандинавська Квартира",
    titleEn: "Nordic Apartment",
    categoryUa: "Житловий інтер'єр",
    categoryEn: "Residential",
    year: "2026",
    area: "95 м²",
    styleUa: "Скандинавський світлий",
    styleEn: "Nordic Light",
    clientUa: "Приватна особа",
    clientEn: "Private Individual",
    descriptionUa: "Світлі пастельні відтінки, функціональні меблі та максимум природного світла. Проєкт створений для молодої родини.",
    descriptionEn: "Light pastel shades, functional furniture, and maximum natural light. Designed for a modern young family.",
    mainImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1615874959474-d6099696fc52?q=80&w=1000&auto=format&fit=crop"
    ]
  },
  {
    id: "dark-loft",
    titleUa: "Лофт з темними акцентами",
    titleEn: "Dark Industrial Loft",
    categoryUa: "Лофт",
    categoryEn: "Industrial",
    year: "2025",
    area: "140 м²",
    styleUa: "Індустріальний лофт",
    styleEn: "Industrial Loft",
    clientUa: "Галерея сучасного мистецтва",
    clientEn: "Modern Art Gallery",
    descriptionUa: "Брутальні стіни з цегли, чорні металеві конструкції, шкіряні меблі та атмосферне акцентне освітлення.",
    descriptionEn: "Brutal brick walls, black metal structures, leather furniture, and atmospheric accent lighting.",
    mainImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop"
    ]
  },
  {
    id: "japandi-villa",
    titleUa: "Вілла в стилі Джапаннді",
    titleEn: "Japandi Villa",
    categoryUa: "Архітектура & Інтер'єр",
    categoryEn: "Architecture & Interior",
    year: "2026",
    area: "410 м²",
    styleUa: "Джапаннді / Дзен",
    styleEn: "Japandi / Zen",
    clientUa: "Приватний замовник",
    clientEn: "Private Client",
    descriptionUa: "Поєднання японського мінімалізму та скандинавського комфорту. Чисті лінії, бамбук, мікроцемент та єдність з природою.",
    descriptionEn: "A fusion of Japanese minimalism and Scandinavian comfort. Clean lines, bamboo, micro-cement, and harmony with nature.",
    mainImage: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1000&auto=format&fit=crop"
    ]
  }
];

export type Currency = "UAH" | "USD" | "EUR";

export default function Home() {
  const { lang } = useApp();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currency, setCurrency] = useState<Currency>("UAH");
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const offset = direction === "left" ? -clientWidth / 2 : clientWidth / 2;
      sliderRef.current.scrollTo({ left: scrollLeft + offset, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] text-white selection:bg-white selection:text-black font-sans">
      <Header />

      {/* Панель перемикача валют (фіксована або у зручному місці) */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-6 flex justify-end">
        <div className="inline-flex border border-white/10 bg-zinc-900/60 backdrop-blur-md p-1">
          {(["UAH", "USD", "EUR"] as Currency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-3 py-1 text-[10px] font-mono tracking-wider transition-colors ${
                currency === c ? "bg-white text-black font-medium" : "text-zinc-400 hover:text-white"
              }`}
            >
              {c === "UAH" ? "₴ UAH" : c === "USD" ? "$ USD" : "€ EUR"}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-end px-6 md:px-12 pb-16 pt-16 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop" 
            alt="Interior Architecture" 
            className="w-full h-full object-cover object-center scale-105 animate-pulse duration-[10000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-[#070708]/60 to-transparent"></div>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-400 mb-4 block">
              {lang === "UA" ? "Студія 3D Архітектури та Дизайну Інтер'єрів" : "3D Architecture & Interior Design Studio"}
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] text-zinc-100">
              {lang === "UA" ? "Архітектурна візуалізація та дизайн простору" : "Architectural Visualization & Space Design"}
            </h1>
          </div>
          <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-end gap-4">
            <a 
              href="#projects" 
              className="text-xs font-mono uppercase tracking-widest bg-white text-black px-8 py-4 rounded-none hover:bg-zinc-200 transition-all font-medium"
            >
              {lang === "UA" ? "Переглянути проєкти" : "View Projects"}
            </a>
            <a 
              href="#calculator" 
              className="text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors border-b border-zinc-800 pb-1"
            >
              {lang === "UA" ? "Розрахувати вартість" : "Calculate Cost"} &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Секція проєктів (Слайдер) */}
      <section id="projects" className="py-24 max-w-7xl mx-auto border-t border-white/5">
        <div className="px-6 md:px-12 flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500 block mb-2">
              {lang === "UA" ? "Обрані роботи" : "Selected Works"}
            </span>
            <h2 className="text-2xl md:text-3xl font-light tracking-wide">
              {lang === "UA" ? "Вибрані проєкти" : "Selected Projects"}
            </h2>
          </div>
          
          {/* Кнопки навігації */}
          <div className="flex gap-3">
            <button 
              onClick={() => scrollSlider("left")}
              className="w-10 h-10 border border-white/20 hover:border-white flex items-center justify-center text-xs font-mono transition-colors cursor-pointer"
            >
              &larr;
            </button>
            <button 
              onClick={() => scrollSlider("right")}
              className="w-10 h-10 border border-white/20 hover:border-white flex items-center justify-center text-xs font-mono transition-colors cursor-pointer"
            >
              &rarr;
            </button>
          </div>
        </div>

        {/* Слайдер зі збільшеними картками (фіксована ширина 275px) */}
        <div 
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto px-6 md:px-12 scrollbar-none snap-x snap-mandatory pb-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {PROJECTS.map((project) => (
            <div 
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="w-[275px] sm:w-[300px] snap-start group cursor-pointer flex-shrink-0"
            >
              <div className="aspect-[4/3] bg-zinc-900 overflow-hidden relative mb-2.5 border border-white/10 group-hover:border-white/40 transition-colors">
                <img 
                  src={project.mainImage} 
                  alt={project.titleEn} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 text-[8px] font-mono tracking-widest uppercase text-zinc-300">
                  {lang === "UA" ? project.categoryUa : project.categoryEn}
                </div>
              </div>
              <div className="flex justify-between items-baseline px-0.5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-200 group-hover:text-white transition-colors truncate pr-2">
                  {lang === "UA" ? project.titleUa : project.titleEn}
                </h3>
                <span className="text-[11px] font-mono text-zinc-500 flex-shrink-0">{project.year}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Інші секції сайту */}
      <div id="services"></div>
      <div id="calculator">
        <Calculator currency={currency} />
      </div>

      <div id="about">
        <About />
      </div>

      <div id="contact">
        <Contact />
      </div>

      {/* Модальне вікно проєкту */}
      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </div>
  );
}