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

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
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
    <div className="mx-auto max-w-7xl px-5 pb-20 pt-32 text-[#1c1b18] sm:px-8 space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 rounded-sm border border-[#e4e0d5] bg-white p-8 sm:p-10 shadow-xs">
        <div>
          <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#8f8c82]">
            {lang === "UA" ? "Особистий кабінет клієнта" : "Client Portal Dashboard"}
          </span>
          <h1 className="mt-2 font-serif text-3xl font-normal text-[#1c1b18]">
            {lang === "UA" ? `Вітаємо, ${userName || "Замовник"}!` : `Welcome, ${userName || "Client"}!`}
          </h1>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-[#6e6c64]">
            {lang === "UA"
              ? "Відстежуйте стан візуалізації ваших об'єктів, погоджуйте ТЗ та додавайте нові приміщення в роботу."
              : "Track the visualization progress of your spaces, approve drafts, and submit new project briefs."}
          </p>
        </div>

        <Link
          href="/client/projects/new"
          className="shrink-0 cursor-pointer rounded-sm bg-[#1c1b18] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#33312c]"
        >
          {lang === "UA" ? "+ Створити новий проєкт" : "+ Create New Project"}
        </Link>
      </div>

      {/* Projects List */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-[#e4e0d5] pb-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1c1b18]">
            {lang === "UA" ? "Ваші активні об'єкти" : "Your Active Projects"}
          </h2>
          <span className="font-mono text-xs text-[#8f8c82]">
            {projects.length} {lang === "UA" ? "об'єктів" : "spaces"}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center font-mono text-xs text-[#8f8c82]">
            {lang === "UA" ? "Завантаження проєктів..." : "Loading projects..."}
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-sm border border-dashed border-[#e4e0d5] bg-white p-14 text-center space-y-4">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f4f0e8] text-xl">
              📐
            </div>
            <div>
              <h3 className="font-serif text-xl font-normal text-[#1c1b18]">
                {lang === "UA" ? "У вас поки немає активних проєктів" : "No active projects yet"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#6e6c64]">
                {lang === "UA"
                  ? "Натисніть кнопку нижче, щоб додати перше технічне завдання, прикріпити креслення (DWG/PDF) та передати простір команді студії."
                  : "Click the button below to upload blueprints (DWG/PDF), outline your style preferences, and launch your project."}
              </p>
            </div>
            <div>
              <Link
                href="/client/projects/new"
                className="inline-block cursor-pointer rounded-sm bg-[#1c1b18] px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-white hover:bg-[#33312c] transition-colors"
              >
                {lang === "UA" ? "Додати перше ТЗ" : "Submit First Brief"}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div
                key={p.id}
                className="flex flex-col justify-between rounded-sm border border-[#e4e0d5] bg-white p-6 shadow-xs transition-shadow hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#8f8c82]">ID: {p.id.slice(0, 8)}</span>
                    <span className="rounded-xs border border-[#e4e0d5] bg-[#f4f0e8] px-2 py-0.5 font-medium text-[#1c1b18]">
                      {PROJECT_STATUS_LABELS[p.status]?.[lang] || p.status}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-normal text-[#1c1b18]">
                    {p.title}
                  </h3>

                  <p className="text-xs text-[#6e6c64]">
                    {p.property_type === "apartment"
                      ? lang === "UA" ? "Квартира" : "Apartment"
                      : p.property_type === "commercial"
                      ? lang === "UA" ? "Комерційне приміщення" : "Commercial space"
                      : lang === "UA" ? "Будинок" : "House"}
                    {` · ${p.area} м²`}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[#e4e0d5] pt-4 text-xs font-mono">
                  <span className="text-[#8f8c82]">
                    {new Date(p.created_at).toLocaleDateString(lang === "UA" ? "uk-UA" : "en-US")}
                  </span>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <Link
                      href={`/client/projects/${p.id}/invoice`}
                      className="font-medium text-[#1c1b18] underline hover:no-underline"
                    >
                      {lang === "UA" ? "Оплата проєкту →" : "Project payment →"}
                    </Link>
                    <Link
                      href={`/project-workspace/${p.id}`}
                      className="font-medium text-[#1c1b18] underline hover:no-underline"
                    >
                      {lang === "UA" ? "Робоча зона →" : "Workspace →"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}