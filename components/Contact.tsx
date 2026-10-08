"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function Contact() {
  const { lang } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
                ? "Зв'яжіться з нами для замовлення 3D-візуалізації, дизайн-проєкту або консультації. Ми працюємо з клієнтами по всьому світу."
                : "Contact us to order 3D visualization, interior design, or a consultation. We work with clients worldwide."}
            </p>
          </div>

          <div className="space-y-4 text-xs font-light text-zinc-300">
            <div>
              <span className="text-zinc-500 block mb-1 uppercase tracking-wider text-[10px]">Email</span>
              <a href="mailto:maradesigninterior@gmail.com" className="hover:text-white transition-colors font-mono">
              Mara design studio
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
                {lang === "UA" ? "Повідомлення надіслано!" : "Message Sent Successfully!"}
              </h3>
              <p className="text-xs font-light text-zinc-400 max-w-sm mx-auto">
                {lang === "UA"
                  ? "Дякуємо за звернення. Ми зв'яжемося з вами найближчим часом."
                  : "Thank you for reaching out. We will get back to you shortly."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 block mb-2">
                    {lang === "UA" ? "Ваше ім'я" : "Your Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 px-4 py-3 text-xs text-white focus:border-white focus:outline-none transition-colors"
                    placeholder={lang === "UA" ? "Роман Кусік" : "Roman Kusik"}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 px-4 py-3 text-xs text-white focus:border-white focus:outline-none transition-colors"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 block mb-2">
                  {lang === "UA" ? "Телефон / Telegram" : "Phone / Telegram"}
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 px-4 py-3 text-xs text-white focus:border-white focus:outline-none transition-colors"
                  placeholder="+380..."
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 block mb-2">
                  {lang === "UA" ? "Повідомлення / Деталі проєкту" : "Message / Project Details"}
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 p-4 text-xs text-white focus:border-white focus:outline-none transition-colors resize-none"
                  placeholder={lang === "UA" ? "Опишіть площу, стиль та побажання..." : "Describe area, style, and requirements..."}
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-white text-black text-xs font-medium tracking-[0.2em] uppercase hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                {lang === "UA" ? "Надіслати запит" : "Send Request"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}