"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";

interface Project {
  id: string;
  title: string;
  status: string;
  area: number;
  property_type: string;
  created_at: string;
}

const PROJECT_STATUS_LABELS: Record<string, { UA: string; EN: string }> = {
  PENDING_APPROVAL: { UA: "На затвердженні", EN: "Pending approval" },
  AWAITING_DESIGNER: { UA: "Очікує дизайнера", EN: "Awaiting designer" },
  IN_PROGRESS: { UA: "В роботі", EN: "In progress" },
  IN_REVIEW: { UA: "На перевірці", EN: "In review" },
  COMPLETED: { UA: "Завершено", EN: "Completed" },
  AWAITING_PAYMENT: { UA: "Очікує оплати", EN: "Awaiting payment" },
};

export default function ClientDashboard() {
  const { lang } = useApp();
  const [userName, setUserName] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadClientData = async () => {
      setLoading(true);

      // Отримуємо поточного залогіненого користувача
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Отримуємо ім'я з профілю
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (profile?.full_name) {
          setUserName(profile.full_name);
        } else if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name);
        }

        // Отримуємо проєкти цього клієнта з Supabase
        const { data: projData } = await supabase
          .from("client_project_requests")
          .select("*")
          .eq("client_id", user.id)
          .order("created_at", { ascending: false });

        if (projData) {
          setProjects(projData as Project[]);
        }
      }
      setLoading(false);
    };

    loadClientData();
  }, []);

  return (
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto text-white space-y-8 font-sans">
      {/* Шапка кабінету клієнта */}
      <div className="bg-[#121214] border border-white/10 p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <span className="text-xs font-mono uppercase text-zinc-500">

          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            {lang === "UA" ? `Вітаємо, ${userName || "Замовник"}!` : `Welcome, ${userName || "Client"}!`}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {lang === "UA"
              ? "Тут ви можете відстежувати хід візуалізації, узгоджувати ТЗ та додавати нові об'єкти."
              : "Track your design project status and manage specifications."}
          </p>
        </div>

        {/* Головна кнопка створення нового проєкту */}
        <Link
          href="/client/projects/new"
          className="bg-white text-black font-semibold px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider hover:bg-zinc-200 transition cursor-pointer font-mono shadow-lg shrink-0"
        >
          {lang === "UA" ? "+ Створити новий проєкт" : "+ Create New Project"}
        </Link>
      </div>

      {/* Список проєктів клієнта */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
          {lang === "UA" ? "Ваші об'єкти та проєкти" : "Your Projects"}
        </h2>

        {loading ? (
          <div className="text-xs font-mono text-zinc-500 py-8">
            {lang === "UA" ? "Завантаження проєктів..." : "Loading projects..."}
          </div>
        ) : projects.length === 0 ? (
          /* Порожній стан, якщо проєктів ще немає */
          <div className="bg-[#121214]/60 border border-dashed border-white/10 p-12 rounded-3xl text-center space-y-4">
            <div className="text-3xl opacity-40">🏠</div>
            <div>
              <h3 className="text-sm font-bold">
                {lang === "UA" ? "У вас поки немає активних проєктів" : "No active projects yet"}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
                {lang === "UA"
                  ? "Натисніть кнопку нижче, щоб заповнити ТЗ, прикріпити креслення та відправити об'єкт у роботу студії."
                  : "Click the button below to fill out specs and attach drawings."}
              </p>
            </div>
            <Link
              href="/client/projects/new"
              className="inline-block bg-white text-black font-semibold px-5 py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-zinc-200 transition font-mono"
            >
              {lang === "UA" ? "Додати перше ТЗ" : "Add First Project"}
            </Link>
          </div>
        ) : (
          /* Картки активних проєктів */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-[#121214] border border-white/10 p-6 rounded-2xl space-y-4 hover:border-white/30 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-mono text-zinc-500">ID: {p.id.slice(0, 8)}...</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {PROJECT_STATUS_LABELS[p.status]?.[lang] || p.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{p.title}</h3>
                  <p className="text-xs font-mono text-zinc-400 mt-2">
                    {p.property_type === "apartment" ? "Квартира" : "Будинок"} | {p.area} м²
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs font-mono">
                  <span className="text-zinc-500">{new Date(p.created_at).toLocaleDateString()}</span>
                  <Link
                    href={`/project-workspace/${p.id}`}
                    className="text-white hover:underline"
                  >
                    {lang === "UA" ? "Деталі →" : "Details →"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}