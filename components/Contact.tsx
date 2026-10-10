"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

// Список країн з перекладами для UA та EN
const COUNTRY_CODES = [
  { code: "+380", ua: "Україна (+380)", en: "Ukraine (+380)" },
  { code: "+48", ua: "Польща (+48)", en: "Poland (+48)" },
  { code: "+49", ua: "Німеччина (+49)", en: "Germany (+49)" },
  { code: "+44", ua: "Велика Британія (+44)", en: "United Kingdom (+44)" },
  { code: "+1", ua: "США / Канада (+1)", en: "USA / Canada (+1)" },
  { code: "email", ua: "Email / Telegram (текстом)", en: "Email / Telegram (text)" },

  // Скандинавія
  { code: "+45", ua: "Данія (+45)", en: "Denmark (+45)" },
  { code: "+358", ua: "Фінляндія (+358)", en: "Finland (+358)" },
  { code: "+354", ua: "Ісландія (+354)", en: "Iceland (+354)" },
  { code: "+47", ua: "Норвегія (+47)", en: "Norway (+47)" },
  { code: "+46", ua: "Швеція (+46)", en: "Sweden (+46)" },

  // Решта Європи
  { code: "+355", ua: "Албанія (+355)", en: "Albania (+355)" },
  { code: "+376", ua: "Андорра (+376)", en: "Andorra (+376)" },
  { code: "+43", ua: "Австрія (+43)", en: "Austria (+43)" },
  { code: "+375", ua: "Білорусь (+375)", en: "Belarus (+375)" },
  { code: "+32", ua: "Бельгія (+32)", en: "Belgium (+32)" },
  { code: "+387", ua: "Боснія і Герцеговина (+387)", en: "Bosnia and Herzegovina (+387)" },
  { code: "+359", ua: "Болгарія (+359)", en: "Bulgaria (+359)" },
  { code: "+385", ua: "Хорватія (+385)", en: "Croatia (+385)" },
  { code: "+357", ua: "Кіпр (+357)", en: "Cyprus (+357)" },
  { code: "+420", ua: "Чехія (+420)", en: "Czech Republic (+420)" },
  { code: "+372", ua: "Естонія (+372)", en: "Estonia (+372)" },
  { code: "+33", ua: "Франція (+33)", en: "France (+33)" },
  { code: "+995", ua: "Грузія (+995)", en: "Georgia (+995)" },
  { code: "+30", ua: "Греція (+30)", en: "Greece (+30)" },
  { code: "+36", ua: "Угорщина (+36)", en: "Hungary (+36)" },
  { code: "+353", ua: "Ірландія (+353)", en: "Ireland (+353)" },
  { code: "+39", ua: "Італія (+39)", en: "Italy (+39)" },
  { code: "+383", ua: "Косово (+383)", en: "Kosovo (+383)" },
  { code: "+371", ua: "Латвія (+371)", en: "Latvia (+371)" },
  { code: "+423", ua: "Ліхтенштейн (+423)", en: "Liechtenstein (+423)" },
  { code: "+370", ua: "Литва (+370)", en: "Lithuania (+370)" },
  { code: "+352", ua: "Люксембург (+352)", en: "Luxembourg (+352)" },
  { code: "+356", ua: "Мальта (+356)", en: "Malta (+356)" },
  { code: "+373", ua: "Молдова (+373)", en: "Moldova (+373)" },
  { code: "+377", ua: "Монако (+377)", en: "Monaco (+377)" },
  { code: "+382", ua: "Чорногорія (+382)", en: "Montenegro (+382)" },
  { code: "+31", ua: "Нідерланди (+31)", en: "Netherlands (+31)" },
  { code: "+389", ua: "Північна Македонія (+389)", en: "North Macedonia (+389)" },
  { code: "+351", ua: "Португалія (+351)", en: "Portugal (+351)" },
  { code: "+40", ua: "Румунія (+40)", en: "Romania (+40)" },
  { code: "+378", ua: "Сан-Марино (+378)", en: "San Marino (+378)" },
  { code: "+381", ua: "Сербія (+381)", en: "Serbia (+381)" },
  { code: "+421", ua: "Словаччина (+421)", en: "Slovakia (+421)" },
  { code: "+386", ua: "Словенія (+386)", en: "Slovenia (+386)" },
  { code: "+34", ua: "Іспанія (+34)", en: "Spain (+34)" },
  { code: "+41", ua: "Швейцарія (+41)", en: "Switzerland (+41)" },
  { code: "+90", ua: "Туреччина (+90)", en: "Turkey (+90)" },
  { code: "+379", ua: "Ватикан (+379)", en: "Vatican City (+379)" },

  // Північна Америка
  { code: "+52", ua: "Мексика (+52)", en: "Mexico (+52)" },

  // Південна Америка
  { code: "+54", ua: "Аргентина (+54)", en: "Argentina (+54)" },
  { code: "+591", ua: "Болівія (+591)", en: "Bolivia (+591)" },
  { code: "+55", ua: "Бразилія (+55)", en: "Brazil (+55)" },
  { code: "+56", ua: "Чилі (+56)", en: "Chile (+56)" },
  { code: "+57", ua: "Колумбія (+57)", en: "Colombia (+57)" },
  { code: "+593", ua: "Еквадор (+593)", en: "Ecuador (+593)" },
  { code: "+592", ua: "Гаяна (+592)", en: "Guyana (+592)" },
  { code: "+595", ua: "Парагвай (+595)", en: "Paraguay (+595)" },
  { code: "+51", ua: "Перу (+51)", en: "Peru (+51)" },
  { code: "+597", ua: "Суринам (+597)", en: "Suriname (+597)" },
  { code: "+598", ua: "Уругвай (+598)", en: "Uruguay (+598)" },
  { code: "+58", ua: "Венесуела (+58)", en: "Venezuela (+58)" },
];

export default function Contact() {
  const { lang } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    selectedCode: "+380",
    phoneOrContact: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fullContact =
      formData.selectedCode === "email"
        ? formData.phoneOrContact
        : `${formData.selectedCode} ${formData.phoneOrContact}`;

    try {
      const response = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          contact: fullContact,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setSubmitted(true);
    } catch (err) {
      setError(
        lang === "UA"
          ? "Помилка відправки. Спробуйте ще раз або напишіть нам на пошту."
          : "Failed to send. Please try again or email us directly."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Інформація */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-light tracking-[0.3em] uppercase text-zinc-500 block mb-2">
              {lang === "UA" ? "Контакти" : "Get in Touch"}
            </span>
            <h2 className="text-3xl md:text-5xl font-extralight tracking-tight text-white mb-6">
              {lang === "UA" ? "Обговоримо ваш проєкт?" : "Let's Discuss Your Project"}
            </h2>
            <p className="text-xs font-light text-zinc-400 leading-relaxed mb-8">
              {lang === "UA"
                ? "Заповніть форму, і ми зв'яжемося з вами для обговорення деталей, термінів та кошторису."
                : "Fill out the form and we will contact you to discuss details, timeline, and estimate."}
            </p>
          </div>

          <div className="space-y-4 text-xs font-light text-zinc-300">
            <div>
              <span className="text-zinc-500 block mb-1 uppercase tracking-wider text-[10px]">Email</span>
              <a href="mailto:maradesigninterior@gmail.com" className="hover:text-white transition-colors font-mono">
                maradesigninterior@gmail.com
              </a>
            </div>
            <div>
              <span className="text-zinc-500 block mb-1 uppercase tracking-wider text-[10px]">
                {lang === "UA" ? "Локація / Базування" : "Location / Base"}
              </span>
              <span className="font-mono">Ukraine / Remote Global</span>
            </div>
          </div>
        </div>

        {/* Форма зворотного зв'язку */}
        <div className="lg:col-span-7 bg-[#121214] p-8 md:p-12 border border-white/5 rounded-sm">
          {submitted ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-lg">
                ✓
              </div>
              <h3 className="text-xl font-light text-white mb-3">
                {lang === "UA" ? "Запит успішно надіслано!" : "Request Sent Successfully!"}
              </h3>
              <p className="text-xs font-light text-zinc-400 max-w-sm mx-auto">
                {lang === "UA"
                  ? "Сповіщення надійшло в студію. Ми зв'яжемося з вами найближчим часом."
                  : "Notification sent to the studio. We will get back to you shortly."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {error && (
                <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-200 text-xs">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 block mb-2">
                    {lang === "UA" ? "Як до вас звертатись?" : "Your Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 px-4 py-3 text-xs text-white focus:border-white focus:outline-none transition-colors"
                    placeholder={lang === "UA" ? "Ім'я Прізвище" : "Your name"}
                  />
                </div>

                {/* Поле контакту з вибором коду країни */}
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 block mb-2">
                    {lang === "UA" ? "Номер телефону / Контакт" : "Phone Number / Contact"}
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.selectedCode}
                      onChange={(e) => setFormData({ ...formData, selectedCode: e.target.value })}
                      className="bg-black border border-white/10 px-3 py-3 text-xs text-white focus:border-white focus:outline-none transition-colors font-mono max-w-[150px] truncate"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {lang === "UA" ? c.ua : c.en}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      required
                      value={formData.phoneOrContact}
                      onChange={(e) => setFormData({ ...formData, phoneOrContact: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 px-4 py-3 text-xs text-white focus:border-white focus:outline-none transition-colors font-mono"
                      placeholder={
                        formData.selectedCode === "email"
                          ? "name@example.com або @username"
                          : "67 123 4567"
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 block mb-2">
                  {lang === "UA" ? "Деталі проєкту / Повідомлення" : "Project Details / Message"}
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 p-4 text-xs text-white focus:border-white focus:outline-none transition-colors resize-none"
                  placeholder={lang === "UA" ? "Опишіть ваші побажання щодо стилю чи термінів..." : "Describe style preferences or timeline..."}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-white text-black text-xs font-medium tracking-[0.2em] uppercase hover:bg-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading
                  ? lang === "UA"
                    ? "Надсилання..."
                    : "Sending..."
                  : lang === "UA"
                  ? "Надіслати запит у студію"
                  : "Send Request to Studio"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}