"use client";

import { useApp } from "@/context/AppContext";

export interface Project {
  id: string;
  titleUa: string;
  titleEn: string;
  categoryUa: string;
  categoryEn: string;
  year: string;
  area: string;
  styleUa: string;
  styleEn: string;
  clientUa: string;
  clientEn: string;
  descriptionUa: string;
  descriptionEn: string;
  mainImage: string;
  gallery: string[];
}

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const { lang } = useApp();

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0e0e10] border border-white/10 p-6 md:p-12 text-white max-h-[92vh] overflow-y-auto shadow-2xl">
        
        {/* Шапка модального вікна */}
        <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
          <span className="text-xs font-mono tracking-[0.25em] uppercase text-zinc-400">
            {lang === "UA" ? project.categoryUa : project.categoryEn} / {project.year}
          </span>
          <button 
            onClick={onClose}
            className="text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 transition-all cursor-pointer"
          >
            {lang === "UA" ? "Закрити [✕]" : "Close [✕]"}
          </button>
        </div>

        {/* Назва та характеристики проєкту */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 items-end">
          <div className="lg:col-span-7">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight">
              {lang === "UA" ? project.titleUa : project.titleEn}
            </h2>
          </div>
          
          {/* Детальна інформація: площа, стиль, замовник, рік */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 text-xs font-mono border-l border-white/10 pl-6">
            <div>
              <span className="block text-zinc-600 uppercase text-[10px] mb-1">{lang === "UA" ? "Площа" : "Area"}</span>
              <span className="text-white font-medium">{project.area}</span>
            </div>
            <div>
              <span className="block text-zinc-600 uppercase text-[10px] mb-1">{lang === "UA" ? "Стиль" : "Style"}</span>
              <span className="text-white font-medium">{lang === "UA" ? project.styleUa : project.styleEn}</span>
            </div>
            <div>
              <span className="block text-zinc-600 uppercase text-[10px] mb-1">{lang === "UA" ? "Замовник" : "Client"}</span>
              <span className="text-white font-medium">{lang === "UA" ? project.clientUa : project.clientEn}</span>
            </div>
            <div>
              <span className="block text-zinc-600 uppercase text-[10px] mb-1">{lang === "UA" ? "Рік" : "Year"}</span>
              <span className="text-white font-medium">{project.year}</span>
            </div>
          </div>
        </div>

        {/* Головне фото */}
        <div className="w-full aspect-[16/9] bg-zinc-900 mb-8 border border-white/10 overflow-hidden">
          <img src={project.mainImage} alt={project.titleEn} className="w-full h-full object-cover" />
        </div>

        {/* Опис */}
        <div className="mb-12 max-w-3xl">
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">
            {lang === "UA" ? "Про концепцію" : "About Concept"}
          </h3>
          <p className="text-sm md:text-base text-zinc-300 font-light leading-relaxed">
            {lang === "UA" ? project.descriptionUa : project.descriptionEn}
          </p>
        </div>

        {/* Додаткова галерея рендерів */}
        <div>
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-6">
            {lang === "UA" ? "Галерея візуалізацій" : "Visual Gallery"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.gallery.map((imgUrl, idx) => (
              <div key={idx} className="aspect-[16/10] bg-zinc-900 overflow-hidden border border-white/5 group">
                <img 
                  src={imgUrl} 
                  alt={`Render ${idx + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}