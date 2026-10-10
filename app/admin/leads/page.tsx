"use client";
import Link from "next/link";

// У верхній частині сторінки адміна:
<div className="flex gap-3 font-mono text-xs mb-6">
  <Link
    href="/admin/projects"
    className="bg-white text-black font-semibold px-4 py-2 rounded-xl transition"
  >
    🏗️ Управління проєктами & ТЗ
  </Link>
  <Link
    href="/admin/leads"
    className="bg-zinc-900 text-zinc-400 hover:text-white border border-white/10 px-4 py-2 rounded-xl transition"
  >
    📋 Заявки з калькулятора (Leads)
  </Link>
</div>
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Користувач");
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"ua" | "en">("ua");

  const checkLang = () => {
    const saved = localStorage.getItem("lang") || localStorage.getItem("locale");
    if (saved) {
      setLang(saved.toLowerCase().includes("en") ? "en" : "ua");
    }
  };

  useEffect(() => {
    checkLang();

    // Слухаємо кастомну подію або клік по кнопках шапки
    const handleLangChange = () => checkLang();
    window.addEventListener("languageChange", handleLangChange);
    window.addEventListener("storage", handleLangChange);

    // Додатково слухаємо кліки по сторінці (на випадок перемикання в шапці)
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.innerText) {
        const text = target.innerText.trim().toUpperCase();
        if (text === "EN") {
          localStorage.setItem("lang", "en");
          setLang("en");
        } else if (text === "UA") {
          localStorage.setItem("lang", "ua");
          setLang("ua");
        }
      }
    };

    document.addEventListener("click", handleGlobalClick);

    // Отримання профілю
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.push("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

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

    return () => {
      window.removeEventListener("languageChange", handleLangChange);
      window.removeEventListener("storage", handleLangChange);
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-[#070708] text-white pt-32 px-6 font-mono">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-zinc-900 border border-white/10 p-8 rounded-xl space-y-2">
          <h1 className="text-xl font-bold tracking-tight">
            {lang === "en" ? `Welcome, ${loading ? "..." : userName}!` : `Вітаємо, ${loading ? "..." : userName}!`}
          </h1>
          <p className="text-xs text-zinc-400">
            {lang === "en"
              ? "Here you can view the status of your design project and visualization stages."
              : "Тут ви зможете переглядати статус вашого дизайн-проєкту та етапи візуалізації."}
          </p>
        </div>
      </div>
    </main>
  );
}