"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function AdminLeadsPage() {
  const router = useRouter();
  const { lang } = useApp();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();

        if (profile?.role !== "admin") {
          router.push("/client");
          return;
        }

        if (profile?.full_name) {
          setUserName(profile.full_name);
        }
      } catch (err) {
        console.error("Помилка завантаження профілю:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#faf8f5] px-5 pb-20 pt-32 text-[#1c1b18] sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Admin Navigation Tabs */}
        <div className="flex gap-3 font-mono text-xs">
          <Link
            href="/admin/projects"
            className="rounded-sm border border-[#e4e0d5] bg-white px-4 py-2 font-medium text-[#1c1b18] hover:bg-[#faf8f5] transition-colors"
          >
            🏗️ {lang === "UA" ? "Управління проєктами & ТЗ" : "Manage Projects & Specs"}
          </Link>
          <Link
            href="/admin/leads"
            className="rounded-sm bg-[#1c1b18] px-4 py-2 font-medium text-white transition-colors"
          >
            📋 {lang === "UA" ? "Заявки з калькулятора (Leads)" : "Calculator Inquiries (Leads)"}
          </Link>
        </div>

        {/* Header */}
        <div className="rounded-sm border border-[#e4e0d5] bg-white p-8 sm:p-10 shadow-xs">
          <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#8f8c82]">
            {lang === "UA" ? "Панель керування лідами" : "Lead Generation Desk"}
          </span>
          <h1 className="mt-2 font-serif text-3xl font-normal text-[#1c1b18]">
            {lang === "EN"
              ? `Welcome, ${loading ? "..." : userName || "Admin"}!`
              : `Вітаємо, ${loading ? "..." : userName || "Адміністратор"}!`}
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#6e6c64]">
            {lang === "EN"
              ? "Inquiries submitted via the interactive cost calculator and contact forms are delivered directly to the Telegram studio channel."
              : "Заявки, надіслані через інтерактивний калькулятор та форму контактів, надсилаються безпосередньо у Telegram-канал студії."}
          </p>
        </div>

        {/* Telegram Bot Notification Status */}
        <div className="rounded-sm border border-[#e4e0d5] bg-white p-8 shadow-xs space-y-4">
          <h2 className="font-serif text-xl font-normal text-[#1c1b18]">
            {lang === "UA" ? "Канал сповіщень студії (Telegram Bot)" : "Studio Notifications Channel"}
          </h2>
          <p className="text-xs text-[#6e6c64] leading-relaxed">
            {lang === "UA"
              ? "Кожна нова оцінка вартості з розрахунку калькулятора автоматично формує повний звіт із зазначенням типу послуги, площі, активних опцій та контактів замовника."
              : "Each new calculation from the calculator generates a full report with service type, square meters, active options, and client contacts."}
          </p>
          <div className="rounded-xs border border-[#e4e0d5] bg-[#faf8f5] p-4 font-mono text-xs text-[#1c1b18]">
            🟢 {lang === "UA" ? "Статус інтеграції: Активно (/api/telegram)" : "Integration status: Active (/api/telegram)"}
          </div>
        </div>
      </div>
    </main>
  );
}