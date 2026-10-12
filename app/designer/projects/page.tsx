"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";

interface Project {
  id: string;
  title: string;
  client_name: string;
  status: string;
  area: number;
  property_type: string;
  created_at: string;
}

export default function DesignerProjectsPage() {
  const { lang } = useApp();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProjects = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (active) {
          setError(lang === "UA" ? "Потрібно увійти в акаунт." : "Please sign in.");
          setLoading(false);
        }
        return;
      }

      const { data, error: queryError } = await supabase
        .from("client_project_requests")
        .select("id, title, client_name, status, area, property_type, created_at")
        .eq("designer_id", user.id)
        .order("created_at", { ascending: false });

      if (!active) return;

      if (queryError) {
        console.error("Помилка завантаження проєктів дизайнера:", queryError);
        setError(
          lang === "UA"
            ? "Не вдалося завантажити проєкти. Спробуйте оновити сторінку."
            : "Could not load projects. Please refresh the page."
        );
      } else {
        setProjects((data || []) as Project[]);
      }
      setLoading(false);
    };

    void loadProjects();

    return () => {
      active = false;
    };
  }, [lang]);

  const statusLabel = (status: string) => {
    const labels: Record<string, { UA: string; EN: string }> = {
      IN_PROGRESS: { UA: "В роботі", EN: "In progress" },
      IN_REVIEW: { UA: "На перевірці", EN: "In review" },
      COMPLETED: { UA: "Завершено", EN: "Completed" },
      AWAITING_PAYMENT: { UA: "Очікує оплати", EN: "Awaiting payment" },
    };
    return labels[status]?.[lang] || status;
  };

  return (
    <div className="mx-auto max-w-7xl px-5 pb-20 pt-32 text-[#1c1b18] sm:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-sm border border-[#e4e0d5] bg-white p-8 sm:p-10 shadow-xs">
        <div>
          <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#8f8c82]">
            {lang === "UA" ? "Робоче місце 3D-візуалізатора" : "3D Designer Studio Desk"}
          </span>
          <h1 className="mt-2 font-serif text-3xl font-normal text-[#1c1b18]">
            {lang === "UA" ? "Призначені проєкти" : "Assigned Projects"}
          </h1>
          <p className="mt-2 text-xs text-[#6e6c64]">
            {lang === "UA"
              ? "Тут відображаються об'єкти, призначені вам арт-директором для моделювання та рендерингу."
              : "Projects assigned to you by the art director for 3D modeling and rendering."}
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-sm border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-12 text-center font-mono text-xs text-[#8f8c82]">
          {lang === "UA" ? "Завантаження призначених проєктів..." : "Loading assigned projects..."}
        </p>
      ) : projects.length === 0 ? (
        <div className="rounded-sm border border-dashed border-[#e4e0d5] bg-white p-14 text-center text-xs text-[#8f8c82]">
          {lang === "UA"
            ? "Вам ще не призначили нових об'єктів. Щойно адміністратор призначить проєкт, він з'явиться тут."
            : "No projects have been assigned to you yet. Newly assigned spaces will appear here."}
        </div>
      ) : (
        <div className="divide-y divide-[#e4e0d5] rounded-sm border border-[#e4e0d5] bg-white shadow-xs">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/project-workspace/${project.id}`}
              className="grid grid-cols-1 gap-4 p-6 transition-colors hover:bg-[#faf8f5] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="truncate font-serif text-lg font-normal text-[#1c1b18]">
                    {project.title}
                  </h2>
                  <span className="rounded-xs border border-[#e4e0d5] bg-[#f4f0e8] px-2.5 py-0.5 font-mono text-[10px] text-[#1c1b18]">
                    {statusLabel(project.status)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#6e6c64]">
                  {lang === "UA" ? "Замовник" : "Client"}: {project.client_name}
                  {` · ${project.area} м² · `}
                  {new Date(project.created_at).toLocaleDateString(lang === "UA" ? "uk-UA" : "en-US")}
                </p>
              </div>

              <span className="font-mono text-xs font-medium text-[#1c1b18] hover:underline">
                {lang === "UA" ? "Відкрити робочу зону →" : "Open Workspace →"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}