"use client";

import { useState, useRef } from "react";
import About from "@/components/About";
import Calculator from "@/components/PriceCalculator";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ProjectModal, { Project } from "@/components/ProjectModal";
import { useApp } from "@/context/AppContext";
import Link from "next/link";

const PROJECTS: Project[] = [
  {
    id: "penthouse-modernism",
    titleUa: "Penthouse Modernism",
    titleEn: "Penthouse Modernism",
    categoryUa: "Житловий інтер'єр 3D",
    categoryEn: "Residential 3D",
    year: "2025",
    area: "180 м²",
    styleUa: "Сучасний мінімалізм",
    styleEn: "Modern Minimalism",
    clientUa: "Приватний замовник",
    clientEn: "Private Client",
    descriptionUa: "Просторі апартаменти з використанням натурального світлого дуба, вапняку та стриманих монохромних акцентів. Особливу увагу приділено природному освітленню та тактильним PBR-текстурам.",
    descriptionEn: "Spacious residence featuring light oak surfaces, natural limestone, and restrained monochromatic accents. Special attention was paid to natural light flow and tactile PBR materiality.",
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
    categoryUa: "Комерційний інтер'єр",
    categoryEn: "Commercial Space",
    year: "2026",
    area: "320 м²",
    styleUa: "Корпоративний контемпорарі",
    styleEn: "Corporate Contemporary",
    clientUa: "IT-компанія 'TechPulse'",
    clientEn: "TechPulse Inc.",
    descriptionUa: "Функціональний офіс open-space з лаунж-зонами, переговорними та акцентними світловими лініями. Створено повну атмосферу продуктивності та преміального стриманого стилю.",
    descriptionEn: "Functional open-space office with acoustic lounge zones, boardroom, and architectural accent lighting lines. Designed for productivity and refined aesthetic composure.",
    mainImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=1000&auto=format&fit=crop"
    ]
  },
  {
    id: "stonehaven-residence",
    titleUa: "Резиденція Stonehaven",
    titleEn: "Stonehaven Residence",
    categoryUa: "Архітектура & Інтер'єр",
    categoryEn: "Architecture & Interior",
    year: "2026",
    area: "295 м²",
    styleUa: "Органічний мінімалізм",
    styleEn: "Organic Minimalism",
    clientUa: "Приватний замовник",
    clientEn: "Private Client",
    descriptionUa: "Концепція тихого притулку з чистими лініями, пом'якшеними натуральним каменем, дубовими панелями та приглушеною тональною палітрою, що дозволяє світлу вільно пересуватися простором.",
    descriptionEn: "A quiet architectural retreat focusing on clean lines softened by natural stone, oak surfaces, and a muted tonal palette allowing light to move freely throughout.",
    mainImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1000&auto=format&fit=crop"
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
    descriptionEn: "Mountain house with panoramic floor-to-ceiling glazing, wood-burning hearth, and warm natural textiles. Visualization conveys evening warmth and tactile stone textures.",
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
    categoryEn: "Residential Space",
    year: "2026",
    area: "95 м²",
    styleUa: "Скандинавський світлий",
    styleEn: "Nordic Light",
    clientUa: "Приватна особа",
    clientEn: "Private Individual",
    descriptionUa: "Світлі пастельні відтінки, функціональні вбудовані меблі та максимум природного світла. Проєкт створений для комфортного повсякденного життя молодої родини.",
    descriptionEn: "Light warm pastels, functional integrated millwork, and maximum natural light. Designed for effortless rhythm of everyday living.",
    mainImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1615874959474-d6099696fc52?q=80&w=1000&auto=format&fit=crop"
    ]
  },
  {
    id: "japandi-villa",
    titleUa: "Вілла в стилі Джапанді",
    titleEn: "Japandi Villa",
    categoryUa: "Архітектура & Інтер'єр",
    categoryEn: "Architecture & Interior",
    year: "2026",
    area: "410 м²",
    styleUa: "Джапанді / Дзен",
    styleEn: "Japandi / Zen",
    clientUa: "Приватний замовник",
    clientEn: "Private Client",
    descriptionUa: "Гармонія японського мінімалізму та скандинавського комфорту. Чисті архітектурні лінії, бамбук, мікроцемент та нерозривний зв'язок з природним ландшафтом.",
    descriptionEn: "Harmonious union of Japanese minimalism and Scandinavian comfort. Pure architectural lines, bamboo, micro-cement, and connection with surrounding nature.",
    mainImage: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1000&auto=format&fit=crop"
    ]
  }
];

export default function Home() {
  const { lang } = useApp();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const offset = direction === "left" ? -clientWidth / 1.5 : clientWidth / 1.5;
      sliderRef.current.scrollTo({ left: scrollLeft + offset, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#1c1b18]">
      {/* Hero Section — Mirell Aesthetic */}
      <section className="relative flex min-h-[580px] h-[85svh] w-full flex-col justify-end overflow-hidden px-5 pb-14 pt-28 sm:px-8 sm:pb-20 lg:min-h-[660px] lg:h-[88svh] lg:px-12 border-b border-[#e4e0d5]">
        <div className="absolute inset-0 z-0">
          <img
            src="https://snqthbbwfyoogzrtithv.supabase.co/storage/v1/object/public/MainPict/AFCA_LIV_3.jpg"
            alt="Stonehaven Residence Architecture"
            className="h-full w-full object-cover object-center"
          />
          {/* Subtle warm stone gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f5] via-[#faf8f5]/40 to-black/20" />
        </div>

        <div className="relative z-10 w-full max-w-[1600px] mx-auto">
          <div className="max-w-4xl">
            <span className="mb-4 inline-block rounded-xs bg-white/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-[#8C857B] backdrop-blur-md border border-[#e4e0d5]">
              {lang === "UA" ? "Студія 3D Архітектури та Дизайну" : "3D Architecture & Interior Studio"}
            </span>
            <h1 className="font-serif text-4xl font-normal leading-[1.05] text-[#1c1b18] sm:text-6xl md:text-7xl lg:text-8xl">
              {lang === "UA" ? (
                <>Архітектурна візуалізація <br className="hidden sm:inline" />та <span className="italic font-light">дизайн простору</span></>
              ) : (
                <>Architectural visualization <br className="hidden sm:inline" />&amp; <span className="italic font-light">space design</span></>
              )}
            </h1>

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
              <p className="max-w-lg text-sm leading-relaxed text-[#4a4943] sm:text-base">
                {lang === "UA"
                  ? "Створюємо чисті лінії, природні текстури вапняку й дуба та фотореалістичний простір, який можна відчути ще до початку будівництва."
                  : "We craft clean lines, natural oak and limestone materiality, and photorealistic spaces that feel tangible long before construction begins."}
              </p>
              <div className="flex items-center gap-6 text-[11px] font-medium uppercase tracking-[0.18em]">
                <a
                  href="#projects"
                  className="group flex items-center gap-1.5 border-b border-[#1c1b18] pb-1.5 text-[#1c1b18] transition-colors hover:text-[#6e6c64]"
                >
                  {lang === "UA" ? "Проєкти" : "Projects"} <span className="transition-transform group-hover:translate-x-0.5">↘</span>
                </a>
                <a
                  href="#calculator"
                  className="group flex items-center gap-1.5 border-b border-[#e4e0d5] pb-1.5 text-[#6e6c64] transition-colors hover:border-[#1c1b18] hover:text-[#1c1b18]"
                >
                  {lang === "UA" ? "Розрахувати проєкт" : "Estimate cost"} <span className="transition-transform group-hover:translate-x-0.5">↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Slider Section — Mirell Portfolio */}
      <section id="projects" className="mx-auto max-w-[1600px] py-24 sm:py-32">
        <div className="mb-10 flex items-end justify-between gap-6 px-5 sm:mb-14 sm:px-8 lg:px-12">
          <div>
            <span className="mb-3 block text-xs font-medium uppercase tracking-[0.2em] text-[#8C857B]">
              {lang === "UA" ? "Портфоліо · 2025—2026" : "Selected Works · 2025—2026"}
            </span>
            <h2 className="font-serif text-3xl font-normal text-[#1c1b18] sm:text-5xl">
              {lang === "UA" ? "Вибрані простори" : "Selected spaces"}
            </h2>
          </div>

          {/* Slider Arrows */}
          <div className="flex gap-2.5">
            <button
              onClick={() => scrollSlider("left")}
              aria-label={lang === "UA" ? "Попередні проєкти" : "Previous projects"}
              className="flex size-11 cursor-pointer items-center justify-center rounded-sm border border-[#e4e0d5] bg-white text-base text-[#1c1b18] transition-colors hover:border-[#1c1b18] hover:bg-[#1c1b18] hover:text-white"
            >
              &larr;
            </button>
            <button
              onClick={() => scrollSlider("right")}
              aria-label={lang === "UA" ? "Наступні проєкти" : "Next projects"}
              className="flex size-11 cursor-pointer items-center justify-center rounded-sm border border-[#e4e0d5] bg-white text-base text-[#1c1b18] transition-colors hover:border-[#1c1b18] hover:bg-[#1c1b18] hover:text-white"
            >
              &rarr;
            </button>
          </div>
        </div>

        {/* Scrollable Gallery */}
        <div
          ref={sliderRef}
          className="scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-6 sm:px-8 lg:px-12"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {PROJECTS.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="group w-[86vw] max-w-190 shrink-0 cursor-pointer snap-start sm:w-[62vw] lg:w-[min(54vw,720px)]"
            >
              <div className="relative mb-5 aspect-16/10 overflow-hidden rounded-sm bg-[#ece8de] shadow-xs">
                <img
                  src={project.mainImage}
                  alt={project.titleEn}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute bottom-4 left-4 rounded-xs border border-[#e4e0d5] bg-white/90 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-[#1c1b18] backdrop-blur-md sm:bottom-5 sm:left-5">
                  {lang === "UA" ? project.categoryUa : project.categoryEn}
                </div>
              </div>

              <div className="flex items-start justify-between gap-5 border-b border-[#e4e0d5] pb-4">
                <div>
                  <h3 className="font-serif text-xl font-normal text-[#1c1b18] transition-colors group-hover:text-[#6e6c64] sm:text-2xl">
                    {lang === "UA" ? project.titleUa : project.titleEn}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#6e6c64]">
                    {lang === "UA" ? `Площа ${project.area}` : `Area ${project.area}`} · {lang === "UA" ? project.styleUa : project.styleEn}
                  </p>
                </div>
                <span className="shrink-0 pt-1 font-mono text-xs text-[#8f8c82]">
                  {project.year} <span className="ml-1 text-[#1c1b18] transition-transform group-hover:translate-x-1">↗</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process & Business Model Section (Decorilla inspired) */}
      <section id="services" className="border-t border-[#e4e0d5] bg-[#f4f0e8] py-24 sm:py-32">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
          <div className="mb-14 max-w-3xl">
            <span className="mb-3 block text-xs font-medium uppercase tracking-[0.2em] text-[#8C857B]">
              {lang === "UA" ? "Бізнес-модель & Методологія" : "Business Model & Workflow"}
            </span>
            <h2 className="font-serif text-3xl font-normal text-[#1c1b18] sm:text-5xl">
              {lang === "UA"
                ? "Прозорий процес від технічного завдання до реалізації"
                : "A seamless journey from initial brief to photorealistic reality"}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#6e6c64] sm:text-base">
              {lang === "UA"
                ? "Ми побудували модель взаємодії за зразком провідних світових студій (Decorilla): поетапне узгодження, швидкі ітерації, персональний кабінет та інтерактивні панорами."
                : "Inspired by global platforms (Decorilla), our collaborative workflow ensures clarity, milestone approvals, live chat, and interactive VR tours."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="rounded-sm border border-[#e4e0d5] bg-white p-8 shadow-xs">
              <span className="font-serif text-3xl font-normal text-[#8f8c82]">01</span>
              <h3 className="mt-4 font-serif text-xl font-normal text-[#1c1b18]">
                {lang === "UA" ? "Бриф & Швидка оцінка" : "Brief & Quick Estimation"}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-[#6e6c64]">
                {lang === "UA"
                  ? "Завантажте ваші плани (DWG/PDF), заповніть ТЗ у калькуляторі та отримайте фіксовану вартість з урахуванням обраних опцій."
                  : "Upload plans (DWG/PDF), outline your aesthetic requirements, and receive a fixed transparent quote with tailored options."}
              </p>
              <div className="mt-6 border-t border-[#e4e0d5] pt-4 text-[11px] font-medium text-[#1c1b18]">
                {lang === "UA" ? "✓ Затвердження кошторису за 24 години" : "✓ Estimate finalized within 24 hours"}
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-sm border border-[#e4e0d5] bg-white p-8 shadow-xs">
              <span className="font-serif text-3xl font-normal text-[#8f8c82]">02</span>
              <h3 className="mt-4 font-serif text-xl font-normal text-[#1c1b18]">
                {lang === "UA" ? "3D-Концепції & VR 360°" : "3D Concepts & VR 360°"}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-[#6e6c64]">
                {lang === "UA"
                  ? "Побудова точної геометрії, налаштування світлових сценаріїв та презентація інтерактивних ракурсів для первинного узгодження."
                  : "Accurate modeling, spatial lighting scenarios, and interactive 360° panoramas allowing you to step inside your room before committing."}
              </p>
              <div className="mt-6 border-t border-[#e4e0d5] pt-4 text-[11px] font-medium text-[#1c1b18]">
                {lang === "UA" ? "✓ Ітерації правок у кабінеті проєкту" : "✓ Real-time feedback in Project Workspace"}
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-sm border border-[#e4e0d5] bg-white p-8 shadow-xs">
              <span className="font-serif text-3xl font-normal text-[#8f8c82]">03</span>
              <h3 className="mt-4 font-serif text-xl font-normal text-[#1c1b18]">
                {lang === "UA" ? "Фінальні рендери & Пакет креслень" : "High-Res CGI & Documentation"}
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-[#6e6c64]">
                {lang === "UA"
                  ? "Рендери ультрависокої роздільності (4K/8K), специфікація оздоблювальних матеріалів та готові пакети для будівельників."
                  : "High-resolution 4K/8K presentation renders, material schedules, and contractor-ready architectural specifications."}
              </p>
              <div className="mt-6 border-t border-[#e4e0d5] pt-4 text-[11px] font-medium text-[#1c1b18]">
                {lang === "UA" ? "✓ Повна передача файлів та авторський нагляд" : "✓ Complete handover with asset storage"}
              </div>
            </div>
          </div>

          {/* Client Portal Callout */}
          <div className="mt-12 rounded-sm border border-[#e4e0d5] bg-[#faf8f5] p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#8C857B]">
                {lang === "UA" ? "Екосистема співпраці" : "Client Ecosystem"}
              </span>
              <h3 className="font-serif text-2xl font-normal text-[#1c1b18] mt-1">
                {lang === "UA" ? "Кабінет клієнта та робоча зона проєкту" : "Client Portal & Project Workspace"}
              </h3>
              <p className="text-xs text-[#6e6c64] mt-2 max-w-xl leading-relaxed">
                {lang === "UA"
                  ? "Відстежуйте статуси завдань, погоджуйте версії рендерів, ведіть прямий діалог з візуалізатором та зберігайте всі матеріали в одному місці."
                  : "Track milestones, approve render drafts, chat directly with your designer, and access high-res files from a secure dashboard."}
              </p>
            </div>
            <Link
              href="/login"
              className="shrink-0 cursor-pointer rounded-sm bg-[#1c1b18] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-white hover:bg-[#33312c] transition-colors"
            >
              {lang === "UA" ? "Увійти в кабінет →" : "Access Workspace →"}
            </Link>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <div id="calculator" className="border-t border-[#e4e0d5]">
        <Calculator />
      </div>

      {/* About Section */}
      <div id="about">
        <About />
      </div>

      {/* Contact Section */}
      <div id="contact">
        <Contact />
      </div>

      <Footer />

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}