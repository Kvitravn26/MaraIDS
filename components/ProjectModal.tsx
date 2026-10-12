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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1c1b18]/65 p-3 sm:p-6 backdrop-blur-sm">
      <div className="relative my-auto max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-sm border border-[#e4e0d5] bg-[#faf8f5] p-6 text-[#1c1b18] shadow-2xl sm:p-10 lg:p-12">
        {/* Modal Top Bar */}
        <div className="mb-8 flex items-center justify-between border-b border-[#e4e0d5] pb-4">
          <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-[#6e6c64]">
            <span>{lang === "UA" ? project.categoryUa : project.categoryEn}</span>
            <span>·</span>
            <span>{project.year}</span>
          </div>

          <button
            onClick={onClose}
            aria-label={lang === "UA" ? "Закрити проєкт" : "Close project"}
            className="flex size-9 cursor-pointer items-center justify-center rounded-sm border border-[#e4e0d5] bg-white text-base text-[#1c1b18] transition-colors hover:border-[#1c1b18] hover:bg-[#1c1b18] hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Project Title and Metadata */}
        <div className="mb-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em] text-[#8f8c82]">
              {lang === "UA" ? "Архітектурний кейс" : "Case Study"}
            </span>
            <h2 className="font-serif text-3xl font-normal leading-tight text-[#1c1b18] sm:text-4xl lg:text-5xl">
              {lang === "UA" ? project.titleUa : project.titleEn}
            </h2>
          </div>

          {/* Facts Grid */}
          <div className="grid grid-cols-2 rounded-sm border border-[#e4e0d5] bg-white p-4 text-xs lg:col-span-5">
            {[
              { label: lang === "UA" ? "Площа" : "Area", value: project.area },
              {
                label: lang === "UA" ? "Стилістика" : "Style",
                value: lang === "UA" ? project.styleUa : project.styleEn,
              },
              {
                label: lang === "UA" ? "Замовник" : "Client",
                value: lang === "UA" ? project.clientUa : project.clientEn,
              },
              { label: lang === "UA" ? "Рік" : "Year", value: project.year },
            ].map((fact) => (
              <div key={fact.label} className="p-2.5">
                <span className="block text-[10px] uppercase tracking-[0.14em] text-[#8f8c82]">
                  {fact.label}
                </span>
                <span className="mt-1 block font-medium text-[#1c1b18]">{fact.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Cover Render */}
        <div className="mb-10 aspect-16/10 w-full overflow-hidden rounded-sm bg-[#ece8de] shadow-xs">
          <img
            src={project.mainImage}
            alt={project.titleEn}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Concept Description */}
        <div className="mb-12 grid grid-cols-1 gap-6 border-y border-[#e4e0d5] py-8 sm:grid-cols-12 sm:gap-10">
          <div className="sm:col-span-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8f8c82]">
              {lang === "UA" ? "Концепція" : "The Concept"}
            </span>
          </div>
          <div className="sm:col-span-9">
            <p className="text-sm leading-relaxed text-[#4a4943] sm:text-base sm:leading-[1.8]">
              {lang === "UA" ? project.descriptionUa : project.descriptionEn}
            </p>
          </div>
        </div>

        {/* Gallery */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1c1b18]">
              {lang === "UA" ? "Галерея візуалізацій" : "Visual Gallery"}
            </h3>
            <span className="font-mono text-xs text-[#8f8c82]">
              0{project.gallery.length} {lang === "UA" ? "ракурси" : "angles"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {project.gallery.map((imgUrl, idx) => (
              <div
                key={idx}
                className="group aspect-16/10 overflow-hidden rounded-sm bg-[#ece8de]"
              >
                <img
                  src={imgUrl}
                  alt={`Render perspective ${idx + 1}`}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}