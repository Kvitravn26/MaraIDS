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
    id: "crystal-residential-complex",
    titleUa: "ЖК Кристал",
    titleEn: "Crystal Residential Complex",
    categoryUa: "Житловий інтер'єр 3D",
    categoryEn: "Residential 3D",
    year: "2026",
    area: "43 м²",
    styleUa: "Темний сучасний мінімалізм",
    styleEn: "Dark Luxury Minimalism",
    clientUa: "Приватний замовник",
    clientEn: "Private Client",
    descriptionUa: "Інтер’єр, побудований на грі світлотіні, глибоких темних відтінках та вишуканих натуральних текстурах. Простір поєднує виразне морене дерево з вертикальною текстурою, акцентний великоформатний керамограніт під темний мармур із золотаво-бронзовими жилами та м’який текстиль нейтральних тонів.\n\nОсобливий характер проєкту створює продумане архітектурне освітлення: приховані LED-лінії, що підкреслюють геометрію меблів, лаконічні магнітні треки та невагомий дизайнерський світильник-арт-об'єкт над обідньою зоною. Це простір для тих, хто цінує тиху розкіш, затишок і бездоганну естетику.\n\nКлючові деталі: Фасади з мореного дуба, мармуровий фартух із підсвічуванням, дизайнерські акцентні стільці, концептуальне монохромне полотно, прихований гардероб та інтегрована техніка.",
    descriptionEn: "An interior driven by the interplay of light and shadow, deep dark tones, and refined natural textures. The space harmoniously blends rich dark-stained wood with vertical graining, striking large-format dark marble porcelain with golden-bronze veining, and soft neutral-toned textiles.\n\nThe distinct character of the project is shaped by thoughtful architectural lighting: concealed LED accents that highlight clean lines, sleek magnetic track systems, and an ethereal statement chandelier over the dining area. Designed for those who appreciate quiet luxury, warmth, and impeccable aesthetic harmony.\n\nKey details: Dark-stained oak facades, illuminated marble backsplash, custom accent chairs, statement monochrome artwork, seamless hidden storage, and fully integrated appliances.",
    mainImage: "/projects/Krystal_main.jpg",
    gallery: [
      "/projects/Krystal_1.jpg",
      "/projects/Krystal_2.jpg",
      "/projects/Krystal_3.jpg",
      "/projects/Krystal_5.jpg",
      "/projects/Krystal_6.jpg",
      "/projects/Krystal_7.jpg",
      "/projects/Krystal_8.jpeg",
      "/projects/Krystal_9.jpeg",
      "/projects/Krystal_10.jpeg",
    ]
  },
  {
    id: "Soft-Modern",
    titleUa: "М'який модерн",
    titleEn: "Soft Modern",
    categoryUa: "Житловий інтер'єр 3D",
    categoryEn: "Residential 3D",
    year: "2026",
    area: "14 м²",
    styleUa: "Soft Minimal",
    styleEn: "Soft Minimal",
    clientUa: "Приватний замовник",
    clientEn: "Private Client",
    descriptionUa: "Інтер'єр побудований на концепції м'якого мінімалізму та архітектурній пластиці. Головним акцентом виступає фактурне ліжко з об'ємним букле та радіусні фасади меблів, які пом'якшують геометрію кімнати. Нейтральна монохромна палітра в теплих кавово-молочних відтінках доповнена графічним контрастом темного паркету та барельєфним панно з рослинним мотивом. Світильник-хмара додає легкості, а продумана зона робочого столу гармонійно інтегрована в загальну систему зберігання.",
    descriptionEn: "The interior is based on the concept of soft minimalism and architectural form. The main focal points are the textured bed with a voluminous bouclé fabric and the curved furniture fronts, which soften the room’s geometry. The neutral monochromatic palette in warm coffee-and-milk shades is complemented by the graphic contrast of dark parquet flooring and a bas-relief panel featuring a botanical motif. The cloud-shaped light fixture adds a sense of lightness, and the thoughtfully designed desk area is harmoniously integrated into the overall storage system.",
    mainImage: "/projects/Iryna_Dutya_2.jpg",
    gallery: [
      "/projects/Iryna_Dutya_1.jpg",
      "/projects/Iryna_Dutya_3.jpg",
      "/projects/Iryna_Dutya_5.jpg",
      "/projects/Iryna_Dutya_6.jpg",


    ]
  },
  {
    id: "pryve-eisenhower",
    titleUa: "Проект Ейзенховер (Бельгія)",
    titleEn: "Eisenhower Project (Belgium)",
    categoryUa: "Архітектура & Інтер'єр",
    categoryEn: "Architecture & Interior",
    year: "2026",
    area: "85 м²",
    styleUa: "Сучасна класика з елементами Mid-Century",
    styleEn: "Contemporary Classic with Mid-Century Elements",
    clientUa: "Pryve Interior",
    clientEn: "Pryve Interior",
    descriptionUa: "Елегантний та затишний інтер'єр, де класична архітектура гармонійно поєднується з сучасними дизайнерськими рішеннями. Вітальня виконана у світлій нейтральній гамі з теплими акцентами теракотового та натурального дерева. Окрасою простору є різьблений камінний портал з мармуру, доповнений дзеркальним панно та латуневими деталями. У обідній зоні та кухонній групі використані натуральні фактури: дерев'яний стіл овальної форми, стільці з плетеним ротангом та глянцева плитка ручної роботи. Санвузол оформлений у глибоких теракотово-глиняних тонах з акцентною раковиною з натурального травертину, раковиною-колоною та елементами терраццо.",
    descriptionEn: "An elegant and cozy interior seamlessly blending classical architectural details with modern design elements. The living area features a light neutral color palette highlighted by warm terracotta accents and natural wood finishes. A carved marble fireplace portal with an antique-mirrored panel and brass hardware serves as the focal point of the room. The dining space incorporates organic textures, including an oval wooden table, rattan-backed chairs, and glossy zellige-style tiles. The guest bathroom is designed in deep terracotta tones, featuring a custom fluted travertine sink, arched mirror, and terrazzo flooring.",
    mainImage: "/projects/PRYVE_EISENHOWER_1.jpg",
    gallery: [
      "/projects/PRYVE_EISENHOWER_2.jpg",
      "/projects/PRYVE_EISENHOWER_3.jpg",
      "/projects/PRYVE_EISENHOWER_4.jpg",
      "/projects/PRYVE_EISENHOWER_5.jpg",
    ]
  },
  {
    id: "sj-residence",
    titleUa: "S&J Residence (Бельгія)",
    titleEn: "S&J Residence (Belgium)",
    categoryUa: "Житлові інтер'єри / Приватний будинок",
    categoryEn: "Residential Interiors / Private House",
    year: "2025",
    area: "140 м²",
    styleUa: "Сучасний мінімалізм / Джапанді та Organic Modern",
    styleEn: "Soft Minimal / Japandi & Organic Modern",
    clientUa: "Pryve Interior",
    clientEn: "Pryve Interior",
    descriptionUa: "Просторний та світлий інтер'єр приватного будинку, розроблений у концепції естетичного мінімалізму з органічними та натуральними текстурами. Open-space зона об'єднує затишну вітальню з великим модульним диваном, обідню групу з масивним столом з дикого дуба та кухню з акцентним островом, оздобленим калакатта-мармуром. Панорамні вікна з чорним заскленням перегукуються з графічними елементами меблів та світильників. Простора ванна кімната виконана у теплому бежевому монохромі з використанням травертину, рельєфної керамічної плитки, раковин із дикого каменю та латуневої змішувальної фурнітури.",
    descriptionEn: "A spacious and light-filled private residence interior designed through an organic minimalist lens. The open-concept living space features a plush sectional sofa, a dining area centered around a solid live-edge oak table, and a modern kitchen with a waterfall Calacatta marble island. Black-framed grid windows provide a stylish contrast against light-toned plaster, soft textiles, and warm wood flooring. The primary bathroom functions as a serene home spa, highlighting travertine finishes, fluted wall tiles, natural stone vessel sinks, and brushed brass fixtures.",
    mainImage: "/projects/S&J_1.jpg",
    gallery: [
      "/projects/S&J_2.jpg",
      "/projects/S&J_3.jpg",
      "/projects/S&J_4.jpg",
      "/projects/S&J_5.jpg",
      "/projects/S&J_6.jpg",
      "/projects/S&J_7.jpg",
      "/projects/S&J_8.jpg",
    ]
  },
  {
    id: "villa-french-riviera",
    titleUa: "Villa French Riviera",
    titleEn: "Villa French Riviera",
    categoryUa: "Житлові інтер'єри / Приватна вілла",
    categoryEn: "Residential Interiors / Private Villa",
    year: "2025",
    area: "250 м²",
    styleUa: "Сучасна класика з елементами Neo-Classic та Modern Luxury",
    styleEn: "Neo-Classic / Modern Luxury",
    clientUa: "MAAM Studio (Франція)",
    clientEn: "MAAM Studio (France)",
    descriptionUa: "Вишуканий інтер'єр приватної вілли у Франції, виконаний на стику неокласики та сучасного преміального дизайну. Простір вирізняється високими арочними вікнами з темними графічними палітурками, витонченими стельовими карнизами з прихованим підсвічуванням та паркетом художньої викладки. У вітальні гармонійно поєднуються світлий м'який текстиль, глибокі панелі з темного дерева, а також журнальний стіл із вираженою текстурою сірого мармуру. Кухня та обідня зона оснащені масивними островами з мармуру Calacatta, контрастними тонованими фасадами та текстурними стільцями. Головна ванна кімната відтворює атмосферу спа завдяки суцільному оздобленню мармуром, окремо розташованій ванні, латуневим змішувачам під старовину та дизайнерським мармуровим пуфам-столикам.",
    descriptionEn: "  A sophisticated private villa interior in France, blending timeless French Neo-Classicism with contemporary luxury. The architecture features grand arched windows with dark grid frames, classical ceiling moldings with integrated warm lighting, and rich parquet flooring. The living area harmonizes soft light upholstery with deep dark wood wall paneling and a statement grey marble coffee table. The kitchen and dining spaces showcase expansive Calacatta marble counters, rich dark cabinetry, and tactile boucle bar seating. The primary bathroom offers a sanctuary vibe with full marble cladding, a freestanding bathtub, brushed brass fixtures, and custom sculptural marble pedestals.",
    mainImage: "/projects/Villa_1.jpg",
    gallery: [
      "/projects/Villa_2.jpg",
      "/projects/Villa_3.jpg",
      "/projects/Villa_4.jpg",
      "/projects/Villa_5.jpg",
      "/projects/Villa_6.jpg",
      "/projects/Villa_7.jpg",
      "/projects/Villa_8.jpg",
      "/projects/Villa_9.jpg",
    ]
  },
  {
    id: "alpine-chalet-france",
    titleUa: "Alpine Chalet France",
    titleEn: "Alpine Chalet France",
    categoryUa: "Житлові інтер'єри / Альпійське шале",
    categoryEn: "Residential Interiors / Alpine Chalet",
    year: "2025",
    area: "280 м²",
    styleUa: "Сучасне альпійське шале / Alpine Modern & Luxury Rustic",
    styleEn: "Modern Alpine Chalet / Luxury Rustic",
    clientUa: "MAAM Studio (Франція)",
    clientEn: "MAAM Studio (France)",
    descriptionUa: "Розкішний інтер'єр гірського шале у Французьких Альпах, де традиційна альпійська естетика поєднується з сучасним преміальним дизайном. Головний простір подвійної висоти повністю оздоблений натуральним брусом та амбарною дошкою, а його осередком є масивний двосторонній камін та двосвітня обідня зона з великим столом із темного масиву дерева. Особливого шарму інтер'єру надають виразні підвісні світильники з фактурними китицями, скляне огородження мезоніну та панорамний вид на альпійські пейзажі. Ванна кімната виконана у контрастному поєднанні білого мармуру Calacatta, радіусних фасадів із моріного темного дуба та класичного художнього паркету.",
    descriptionEn: "A luxury mountain chalet interior located in the French Alps, seamlessly blending traditional alpine heritage with modern high-end design. The double-height open-plan living and dining area is wrapped in rich reclaimed wood paneling, anchored by a statement stone fireplace and a solid dark-wood dining set. Oversized woven tassel chandeliers create a striking sculptural focus, complemented by glass mezzanine railings and expansive views of the surrounding peaks. The ensuite bathroom pairs polished Calacatta marble walls with dark curved vanity cabinetry and traditional parquet flooring.",
    mainImage: "/projects/Chalet_1.jpg",
    gallery: [
      "/projects/Chalet_2.jpg",
      "/projects/Chalet_3.jpg",
      "/projects/Chalet_4.jpg",
      "/projects/Chalet_5.jpg",
      "/projects/Chalet_6.jpg",
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
                  ? "Професійний дизайн інтер’єру та 3D-візуалізація преміум-класу. Втілюємо затишок, функціональність та естетику у вашому майбутньому домі."
                  : "Professional interior design and premium-quality 3D renderings. We bring comfort, functionality, and aesthetics to life in your future home."}
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
              {lang === "UA" ? "Наше портфоліо" : "Portfolio "}
            </span>
            <h2 className="font-serif text-3xl font-normal text-[#1c1b18] sm:text-5xl">
              {lang === "UA" ? "Завершені проєкти" : "Completed Projects"}
            </h2>
          </div>

          {/* Slider Arrows */}
          <div className="flex gap-2.5">
            <button
              onClick={() => scrollSlider("left")}
              aria-label={lang === "UA" ? "Попередні проєкти" : "Previous projects"}
              className="flex size-12 cursor-pointer items-center justify-center rounded-sm border border-[#e4e0d5] bg-white text-base text-[#1c1b18] transition-colors hover:border-[#1c1b18] hover:bg-[#1c1b18] hover:text-white"
            >
              &larr;
            </button>
            <button
              onClick={() => scrollSlider("right")}
              aria-label={lang === "UA" ? "Наступні проєкти" : "Next projects"}
              className="flex size-12 cursor-pointer items-center justify-center rounded-sm border border-[#e4e0d5] bg-white text-base text-[#1c1b18] transition-colors hover:border-[#1c1b18] hover:bg-[#1c1b18] hover:text-white"
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
                ? "Ми побудували модель взаємодії за зразком провідних світових студій: поетапне узгодження, швидкі ітерації, персональний кабінет та інтерактивні панорами."
                : "Inspired by global platforms , our collaborative workflow ensures clarity, milestone approvals, live chat, and interactive VR tours."}
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
                {lang === "UA" ? "✓ Затвердження кошторису" : "✓ Estimate finalized"}
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
                  ? "Рендери ультрависокої роздільності (4K), специфікація оздоблювальних матеріалів та готові пакети для будівельників."
                  : "High-resolution 4K presentation renders, material schedules, and contractor-ready architectural specifications."}
              </p>
              <div className="mt-6 border-t border-[#e4e0d5] pt-4 text-[11px] font-medium text-[#1c1b18]">
                {lang === "UA" ? "✓ Повна передача файлів" : "✓ Complete file transfer"}
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