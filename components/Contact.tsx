"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { COUNTRY_CODES } from "@/lib/countryCodes";

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
    } catch {
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
    <section id="contact" className="mx-auto max-w-[1600px] scroll-mt-24 border-t border-[#e4e0d5] px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left Column: Direct info */}
        <div className="flex flex-col justify-between lg:col-span-5">
          <div>
            <span className="mb-4 block text-[11px] font-medium uppercase tracking-[0.2em] text-[#6e6c64]">
              {lang === "UA" ? "Контакти · Зв'язок" : "Contact · Get in Touch"}
            </span>
            <h2 className="mb-6 font-serif text-3xl font-normal leading-[1.12] text-[#1c1b18] sm:text-4xl lg:text-5xl">
              {lang === "UA" ? "Обговоримо ваш простір?" : "Let's discuss your space"}
            </h2>
            <p className="mb-8 max-w-md text-sm leading-relaxed text-[#6e6c64]">
              {lang === "UA"
                ? "Залиште запит для консультації або надсилайте креслення для оцінки вартості та термінів візуалізації."
                : "Submit an inquiry for a consultation or share blueprints for an estimation of project timeline and budget."}
            </p>
          </div>

          <div className="space-y-6 border-t border-[#e4e0d5] pt-6 text-xs text-[#4a4943]">
            <div>
              <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#8f8c82]">
            
              </span>
              
            </div>
            <div>
              
            </div>
          </div>
        </div>

        {/* Right Column: Contact form */}
        <div className="border-t border-[#e4e0d5] pt-8 lg:col-span-7 lg:border-t-0 lg:border-l lg:pl-12 lg:pt-0">
          {submitted ? (
            <div className="rounded-sm border border-[#e4e0d5] bg-white p-12 text-center shadow-xs">
              <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-[#1c1b18] text-white">
                ✓
              </div>
              <h3 className="mb-2 font-serif text-2xl text-[#1c1b18]">
                {lang === "UA" ? "Запит успішно надіслано!" : "Request sent successfully!"}
              </h3>
              <p className="mx-auto max-w-sm text-xs leading-relaxed text-[#6e6c64]">
                {lang === "UA"
                  ? "Ми зв'яжемося з вами найближчим часом для обговорення ТЗ та термінів реалізації."
                  : "We will contact you shortly to review your brief, floor plans, and timeline."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {error && (
                <div className="rounded-sm border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
                    {lang === "UA" ? "Ваше ім'я" : "Your Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-sm border border-[#e4e0d5] bg-white px-4 py-3 text-xs text-[#1c1b18] transition-colors focus:border-[#1c1b18] focus:outline-none"
                    placeholder={lang === "UA" ? "Олександр / Марія" : "Alexander / Maria"}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
                    {lang === "UA" ? "Номер телефону / Контакт" : "Phone Number / Contact"}
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.selectedCode}
                      onChange={(e) => setFormData({ ...formData, selectedCode: e.target.value })}
                      className="max-w-[130px] truncate rounded-sm border border-[#e4e0d5] bg-white px-2.5 py-3 text-xs font-mono text-[#1c1b18] focus:border-[#1c1b18] focus:outline-none"
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
                      className="w-full rounded-sm border border-[#e4e0d5] bg-white px-4 py-3 text-xs font-mono text-[#1c1b18] transition-colors focus:border-[#1c1b18] focus:outline-none"
                      placeholder={
                        formData.selectedCode === "email"
                          ? "email@example.com / @username"
                          : "67 123 4567"
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
                  {lang === "UA" ? "Деталі проєкту / Повідомлення" : "Project Details / Message"}
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full resize-none rounded-sm border border-[#e4e0d5] bg-white p-4 text-xs leading-relaxed text-[#1c1b18] transition-colors focus:border-[#1c1b18] focus:outline-none"
                  placeholder={
                    lang === "UA"
                      ? "Опишіть тип об'єкта, площу, побажання щодо стилю чи наявність креслень..."
                      : "Describe space type, area, style preferences, or blueprint availability..."
                  }
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full cursor-pointer rounded-sm bg-[#1c1b18] px-7 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#33312c] disabled:opacity-50 sm:w-auto"
                >
                  {loading
                    ? lang === "UA"
                      ? "Надсилання..."
                      : "Sending..."
                    : lang === "UA"
                    ? "Надіслати запит у студію"
                    : "Send Inquiry to Studio"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}