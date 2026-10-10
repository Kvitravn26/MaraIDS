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
      const { data: { user }, error: userError } = await supabase.auth.getUser();
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
        setError(queryError.message);
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
    <div className="pt-28 pb-16 px-6 max-w-7xl mx-auto text-white">
      <div className="border-b border-white/10 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-zinc-500">
            {lang === "UA" ? "Робоче місце візуалізатора" : "Designer Workspace"}
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            {lang === "UA" ? "Проєкти в роботі" : "Assigned Projects"}
          </h1>
        </div>
      </div>

      {error && <p className="mb-5 text-sm text-red-300">{error}</p>}

      {loading ? (
        <p className="py-10 text-sm font-mono text-zinc-500">
          {lang === "UA" ? "Завантаження проєктів..." : "Loading projects..."}
        </p>
      ) : projects.length === 0 ? (
        <div className="border-y border-white/10 py-12 text-sm text-zinc-500">
          {lang === "UA" ? "Вам ще не призначили проєкти." : "No projects have been assigned to you yet."}
        </div>
      ) : (
        <div className="divide-y divide-white/10 border-y border-white/10">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/project-workspace/${project.id}`}
              className="grid grid-cols-1 gap-3 py-5 transition hover:bg-white/3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="truncate text-base font-semibold">{project.title}</h2>
                  <span className="rounded border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[10px] text-cyan-200">
                    {statusLabel(project.status)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  {lang === "UA" ? "Клієнт" : "Client"}: {project.client_name}
                  {` · ${project.area} м² · `}
                  {new Date(project.created_at).toLocaleDateString(lang === "UA" ? "uk-UA" : "en-US")}
                </p>
              </div>
              <span className="text-xs text-zinc-300">
                {lang === "UA" ? "Відкрити робочу зону →" : "Open workspace →"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}