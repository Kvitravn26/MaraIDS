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
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { PROJECT_FILES_BUCKET } from "@/lib/projectStorage";

interface ProjectFile {
  id?: string;
  name: string;
  path?: string;
  url?: string;
  size?: string;
}

interface RenderVersion {
  id: string;
  version: string;
  createdAt: string;
  comment?: string;
  images?: string[];
}

interface Project {
  id: string;
  title: string;
  client_name: string;
  client_email: string;
  status: "PENDING_APPROVAL" | "AWAITING_DESIGNER" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED" | "AWAITING_PAYMENT";
  area: number;
  property_type: string;
  description: string;
  designer_id?: string;
  created_at: string;
  files: ProjectFile[];
  versions: RenderVersion[];
}

interface DesignerProfile {
  id: string;
  full_name?: string;
  email?: string;
}

export default function AdminProjectsPage() {
  const { lang } = useApp();

  const [projects, setProjects] = useState<Project[]>([]);
  const [designers, setDesigners] = useState<DesignerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");

  // Фільтри для секції "Усі проєкти"
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [designerFilter, setDesignerFilter] = useState<string>("ALL");

  // Модальне вікно призначення дизайнера для нових ТЗ
  const [assignModalProject, setAssignModalProject] = useState<Project | null>(null);
  const [selectedDesignerId, setSelectedDesignerId] = useState<string>("");

  // Детальна сторінка (модальне вікно або вигляд перебігу подій) обраного проєкту
  const [detailsProject, setDetailsProject] = useState<Project | null>(null);

  // Завантаження даних із Supabase
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Отримуємо проєкти
      const { data: projData, error: projError } = await supabase
        .from("client_project_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (projError) throw projError;
      if (projData) {
        const projectsWithFileUrls = await Promise.all(
          projData.map(async (project) => {
            const files = await Promise.all(
              ((project.files as ProjectFile[] | null) || []).map(async (file) => {
                if (!file.path) return file;

                const { data, error } = await supabase.storage
                  .from(PROJECT_FILES_BUCKET)
                  .createSignedUrl(file.path, 60 * 60);

                if (error) {
                  console.error("Помилка створення посилання на файл:", error);
                  return file;
                }

                return { ...file, url: data.signedUrl };
              })
            );

            return { ...project, files };
          })
        );

        setProjects(projectsWithFileUrls as Project[]);
      }

      // 2. Отримуємо список дизайнерів з профілів
      const { data: desData, error: desError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "designer");

      if (desError) throw desError;
      if (desData) setDesigners(desData);
    } catch (err) {
      console.error("Помилка завантаження даних:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Призначення дизайнера та затвердження ТЗ
  const handleAssignDesigner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalProject || !selectedDesignerId) return;

    try {
      const { error } = await supabase
        .from("client_project_requests")
        .update({
          designer_id: selectedDesignerId,
          status: "IN_PROGRESS", // Змінюємо статус на "В роботі"
        })
        .eq("id", assignModalProject.id);

      if (error) throw error;

      alert(lang === "UA" ? "Дизайнера успішно призначено!" : "Designer assigned successfully!");
      setAssignModalProject(null);
      setSelectedDesignerId("");
      fetchData();
    } catch (err) {
      console.error("Помилка призначення:", err);
      alert("Помилка при збереженні. Спробуйте ще раз.");
    }
  };

  // Зміна статусу проєкту адміністратором
  const handleStatusChange = async (projectId: string, newStatus: Project['status']) => {
    try {
      const { error } = await supabase
        .from("client_project_requests")
        .update({ status: newStatus })
        .eq("id", projectId);

      if (error) throw error;
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
      );
      if (detailsProject && detailsProject.id === projectId) {
        setDetailsProject((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error("Помилка оновлення статусу:", err);
    }
  };

  // Фільтрація проєктів
  const pendingProjects = projects.filter(
    (p) => p.status === "PENDING_APPROVAL" || p.status === "AWAITING_DESIGNER"
  );

  const filteredAllProjects = projects.filter((p) => {
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    const matchesDesigner = designerFilter === "ALL" || p.designer_id === designerFilter;
    return matchesStatus && matchesDesigner;
  });

  if (loading) {
    return (
      <div className="pt-32 pb-16 px-6 max-w-7xl mx-auto text-zinc-500 font-mono text-xs">
        {lang === "UA" ? "Завантаження панелі управління..." : "Loading admin panel..."}
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto text-white font-sans space-y-8">
      {/* Шапка адмін-панелі */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-zinc-500">
            {lang === "UA" ? "Панель управління студією" : "Studio Control Center"}
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            {lang === "UA" ? "Кабінет Адміністратора" : "Admin Dashboard"}
          </h1>
        </div>

        {/* Перемикач основних вкладок */}
        <div className="flex items-center bg-[#121214] border border-white/10 rounded-xl p-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-lg transition relative ${
              activeTab === "pending" ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"
            }`}
          >
            {lang === "UA" ? "Нові ТЗ на затвердженні" : "Pending Specs"}
            {pendingProjects.length > 0 && (
              <span className="ml-2 bg-amber-500 text-black px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                {pendingProjects.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "all" ? "bg-white text-black font-semibold" : "text-zinc-400 hover:text-white"
            }`}
          >
            {lang === "UA" ? "Усі проєкти студії" : "All Studio Projects"}
          </button>
        </div>
      </div>

      {/* РОЗДІЛ 1: Нові ТЗ на затвердженні та призначення дизайнера */}
      {activeTab === "pending" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
              {lang === "UA" ? "Вхідні заявки та ТЗ від клієнтів (очікують призначення)" : "Incoming Client Specifications"}
            </h2>
          </div>

          {pendingProjects.length === 0 ? (
            <div className="bg-[#121214] border border-white/5 rounded-2xl p-12 text-center text-zinc-500 font-mono text-xs">
              {lang === "UA" ? "Немає нових проєктів, що очікують затвердження." : "No pending projects found."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingProjects.map((p) => (
                <div key={p.id} className="bg-[#121214] border border-white/10 rounded-2xl p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        {lang === "UA" ? "Очікує призначення" : "Awaiting Designer"}
                      </span>
                      <h3 className="text-lg font-bold mt-2">{p.title}</h3>
                    </div>
                    <span className="text-xs font-mono text-zinc-500">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="text-xs font-mono text-zinc-400 space-y-1 bg-black/40 p-3 rounded-xl border border-white/5">
                    <p>Клієнт: <span className="text-white">{p.client_name}</span> ({p.client_email})</p>
                    <p>Тип: <span className="text-white">{p.property_type}</span> | Площа: <span className="text-white">{p.area} м²</span></p>
                    <p className="pt-2 text-zinc-300">ТЗ: {p.description || "Без опису"}</p>
                  </div>

                  {p.files && p.files.length > 0 && (
                    <div className="text-xs font-mono text-zinc-400">
                      <span>Файли: </span>
                      {p.files.map((f, i) => (
                        f.url ? (
                          <a
                            key={i}
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white underline mr-2"
                          >
                            📎 {f.name}
                          </a>
                        ) : (
                          <span key={i} className="text-zinc-500 mr-2">📎 {f.name}</span>
                        )
                      ))}
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setAssignModalProject(p)}
                      className="bg-white text-black font-semibold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-zinc-200 transition cursor-pointer font-mono"
                    >
                      {lang === "UA" ? "Затвердити та призначити дизайнера →" : "Approve & Assign Designer →"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* РОЗДІЛ 2: Усі проєкти студії */}
      {activeTab === "all" && (
        <div className="space-y-6">
          {/* Панель фільтрів */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#121214] p-4 rounded-2xl border border-white/5 font-mono text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span>{lang === "UA" ? "Статус:" : "Status:"}</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black border border-white/10 px-3 py-2 rounded-xl text-white focus:outline-none"
              >
                <option value="ALL">{lang === "UA" ? "Усі статуси" : "All Statuses"}</option>
                <option value="IN_PROGRESS">{lang === "UA" ? "В роботі" : "In Progress"}</option>
                <option value="IN_REVIEW">{lang === "UA" ? "На перевірці" : "In Review"}</option>
                <option value="COMPLETED">{lang === "UA" ? "Завершено" : "Completed"}</option>
                <option value="AWAITING_PAYMENT">{lang === "UA" ? "Очікує оплати" : "Awaiting Payment"}</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span>{lang === "UA" ? "Дизайнер:" : "Designer:"}</span>
              <select
                value={designerFilter}
                onChange={(e) => setDesignerFilter(e.target.value)}
                className="bg-black border border-white/10 px-3 py-2 rounded-xl text-white focus:outline-none"
              >
                <option value="ALL">{lang === "UA" ? "Усі дизайнери" : "All Designers"}</option>
                {designers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name || d.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Таблиця всіх проєктів */}
          <div className="bg-[#121214] border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black/60 border-b border-white/10 text-zinc-400">
                <tr>
                  <th className="p-4">{lang === "UA" ? "Проєкт" : "Project"}</th>
                  <th className="p-4">{lang === "UA" ? "Клієнт" : "Client"}</th>
                  <th className="p-4">{lang === "UA" ? "Дизайнер" : "Designer"}</th>
                  <th className="p-4">{lang === "UA" ? "Площа" : "Area"}</th>
                  <th className="p-4">{lang === "UA" ? "Статус" : "Status"}</th>
                  <th className="p-4 text-right">{lang === "UA" ? "Дії / Події" : "Actions / Timeline"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAllProjects.map((p) => {
                  const assignedDes = designers.find((d) => d.id === p.designer_id);
                  return (
                    <tr key={p.id} className="hover:bg-zinc-900/40 transition">
                      <td className="p-4 font-bold text-white">
                        <div>{p.title}</div>
                        <div className="text-[10px] text-zinc-500">ID: {p.id.slice(0, 8)}...</div>
                      </td>
                      <td className="p-4 text-zinc-300">
                        <div>{p.client_name}</div>
                        <div className="text-[10px] text-zinc-500">{p.client_email}</div>
                      </td>
                      <td className="p-4 text-zinc-300">
                        {assignedDes ? (
                          <span className="text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                            {assignedDes.full_name || assignedDes.email || assignedDes.id}
                          </span>
                        ) : (
                          <span className="text-amber-400">Не призначено</span>
                        )}
                      </td>
                      <td className="p-4">{p.area} м²</td>
                      <td className="p-4">
                        <select
                          value={p.status}
                          onChange={(e) => handleStatusChange(p.id, e.target.value as Project['status'])}
                          className="bg-black border border-white/10 px-2 py-1 rounded text-[11px] text-white focus:outline-none"
                        >
                          <option value="PENDING_APPROVAL">На затвердженні</option>
                          <option value="IN_PROGRESS">В роботі</option>
                          <option value="IN_REVIEW">На перевірці</option>
                          <option value="COMPLETED">Завершено</option>
                          <option value="AWAITING_PAYMENT">Очікує оплати</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setDetailsProject(p)}
                          className="px-3 py-1.5 bg-white text-black font-semibold rounded-lg text-[10px] uppercase hover:bg-zinc-200 transition cursor-pointer"
                        >
                          {lang === "UA" ? "Перебіг подій →" : "Timeline →"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* МОДАЛЬНЕ ВІКНО: Призначення дизайнера */}
      {assignModalProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-white/10 p-8 rounded-2xl max-w-md w-full space-y-6 text-white font-mono">
            <div>
              <span className="text-xs text-zinc-500 uppercase">Затвердження ТЗ</span>
              <h3 className="text-lg font-bold mt-1">{assignModalProject.title}</h3>
            </div>

            <form onSubmit={handleAssignDesigner} className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-zinc-400 mb-2">
                  {lang === "UA" ? "Оберіть дизайнера для роботи:" : "Select Designer:"}
                </label>
                <select
                  required
                  value={selectedDesignerId}
                  onChange={(e) => setSelectedDesignerId(e.target.value)}
                  className="w-full bg-black border border-white/10 p-3 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="">-- {lang === "UA" ? "Оберіть зі списку" : "Choose designer"} --</option>
                  {designers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name || d.email || d.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalProject(null)}
                  className="w-1/2 bg-zinc-800 text-white font-semibold py-3 rounded-xl text-xs uppercase hover:bg-zinc-700 transition cursor-pointer"
                >
                  {lang === "UA" ? "Скасувати" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-white text-black font-semibold py-3 rounded-xl text-xs uppercase hover:bg-zinc-200 transition cursor-pointer"
                >
                  {lang === "UA" ? "Підтвердити" : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* МОДАЛЬНЕ ВІКНО: Перебіг подій та історія проєкту */}
      {detailsProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121214] border border-white/10 p-8 rounded-2xl max-w-2xl w-full space-y-6 text-white font-mono my-8">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase text-zinc-500">Перебіг подій проєкту</span>
                <h3 className="text-xl font-bold mt-1">{detailsProject.title}</h3>
                <p className="text-xs text-zinc-400 mt-1">Клієнт: {detailsProject.client_name}</p>
              </div>
              <button
                onClick={() => setDetailsProject(null)}
                className="text-zinc-400 hover:text-white text-sm bg-black/50 px-3 py-1 rounded-lg border border-white/10"
              >
                ✕
              </button>
            </div>

            {/* ТЗ та вихідні дані */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase text-zinc-400 tracking-wider">1. Технічне завдання (ТЗ)</h4>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-xs text-zinc-300 space-y-2">
                <p>{detailsProject.description || "Коментарі до ТЗ відсутні."}</p>
                {detailsProject.files && detailsProject.files.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-zinc-500">Прикріплені файли: </span>
                    {detailsProject.files.map((f, i) => (
                      f.url ? (
                        <a
                          key={i}
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white underline mr-3"
                        >
                          📎 {f.name}
                        </a>
                      ) : (
                        <span key={i} className="text-zinc-500 mr-3">📎 {f.name}</span>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Історія версій рендерів від дизайнера */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase text-zinc-400 tracking-wider">2. Історія версій рендерів</h4>
              {detailsProject.versions && detailsProject.versions.length > 0 ? (
                <div className="space-y-2">
                  {detailsProject.versions.map((v) => (
                    <div key={v.id} className="bg-black/50 p-3 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white mr-2">{v.version}</span>
                        <span className="text-zinc-400">{v.comment || "Без коментаря"}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">{v.createdAt}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-xs text-zinc-500 text-center">
                  Дизайнер ще не завантажував версії рендерів.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setDetailsProject(null)}
                className="bg-white text-black font-semibold px-6 py-3 rounded-xl text-xs uppercase hover:bg-zinc-200 transition cursor-pointer"
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}