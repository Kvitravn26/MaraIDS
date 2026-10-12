"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

const STATUS_LABELS: Record<Project["status"], { UA: string; EN: string }> = {
  PENDING_APPROVAL: { UA: "На затвердженні", EN: "Pending approval" },
  AWAITING_DESIGNER: { UA: "Очікує дизайнера", EN: "Awaiting designer" },
  IN_PROGRESS: { UA: "В роботі", EN: "In progress" },
  IN_REVIEW: { UA: "На перевірці", EN: "In review" },
  COMPLETED: { UA: "Завершено", EN: "Completed" },
  AWAITING_PAYMENT: { UA: "Очікує оплати", EN: "Awaiting payment" },
};

const PROPERTY_TYPE_LABELS: Record<string, { UA: string; EN: string }> = {
  apartment: { UA: "Квартира", EN: "Apartment" },
  house: { UA: "Будинок", EN: "House" },
  commercial: { UA: "Комерційне приміщення", EN: "Commercial space" },
};

export default function AdminProjectsPage() {
  const { lang } = useApp();

  const [projects, setProjects] = useState<Project[]>([]);
  const [designers, setDesigners] = useState<DesignerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending");

  // Filters for "All projects"
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [designerFilter, setDesignerFilter] = useState<string>("ALL");

  // Assign modal
  const [assignModalProject, setAssignModalProject] = useState<Project | null>(null);
  const [selectedDesignerId, setSelectedDesignerId] = useState<string>("");

  // Timeline / Details modal
  const [detailsProject, setDetailsProject] = useState<Project | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
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

  const handleAssignDesigner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalProject || !selectedDesignerId) return;

    try {
      const { error } = await supabase
        .from("client_project_requests")
        .update({
          designer_id: selectedDesignerId,
          status: "IN_PROGRESS",
        })
        .eq("id", assignModalProject.id);

      if (error) throw error;

      alert(lang === "UA" ? "Дизайнера успішно призначено!" : "Designer assigned successfully!");
      setAssignModalProject(null);
      setSelectedDesignerId("");
      fetchData();
    } catch (err) {
      console.error("Помилка призначення:", err);
      alert(
        lang === "UA"
          ? "Не вдалося зберегти призначення. Спробуйте ще раз."
          : "Could not save the assignment. Please try again."
      );
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: Project["status"]) => {
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
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-32 font-mono text-xs text-[#8f8c82]">
        {lang === "UA" ? "Завантаження панелі управління..." : "Loading admin panel..."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pb-20 pt-32 text-[#1c1b18] space-y-8 sm:px-8">
      {/* Navigation Tabs */}
      <div className="flex gap-3 font-mono text-xs">
        <Link
          href="/admin/projects"
          className="rounded-sm bg-[#1c1b18] px-4 py-2 font-medium text-white transition-colors"
        >
          🏗️ {lang === "UA" ? "Управління проєктами & ТЗ" : "Manage Projects & Specs"}
        </Link>
        <Link
          href="/admin/leads"
          className="rounded-sm border border-[#e4e0d5] bg-white px-4 py-2 font-medium text-[#1c1b18] hover:bg-[#faf8f5] transition-colors"
        >
          📋 {lang === "UA" ? "Заявки з калькулятора (Leads)" : "Calculator Inquiries (Leads)"}
        </Link>
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-sm border border-[#e4e0d5] bg-white p-8 sm:p-10 shadow-xs">
        <div>
          <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#8f8c82]">
            {lang === "UA" ? "Панель управління студією" : "Studio Management Control"}
          </span>
          <h1 className="mt-2 font-serif text-3xl font-normal text-[#1c1b18]">
            {lang === "UA" ? "Кабінет Арт-Директора / Адміністратора" : "Admin & Art Director Desk"}
          </h1>
        </div>

        {/* Tab switch */}
        <div className="flex items-center rounded-sm border border-[#e4e0d5] bg-[#faf8f5] p-1 font-mono text-xs">
          <button
            onClick={() => setActiveTab("pending")}
            className={`cursor-pointer rounded-xs px-4 py-2 transition-all ${
              activeTab === "pending"
                ? "bg-[#1c1b18] font-medium text-white shadow-xs"
                : "text-[#6e6c64] hover:text-[#1c1b18]"
            }`}
          >
            {lang === "UA" ? "Нові ТЗ" : "Pending Briefs"}
            {pendingProjects.length > 0 && (
              <span className="ml-2 rounded-full bg-[#1c1b18] border border-white/40 px-1.5 py-0.2 text-[10px] font-bold text-white">
                {pendingProjects.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`cursor-pointer rounded-xs px-4 py-2 transition-all ${
              activeTab === "all"
                ? "bg-[#1c1b18] font-medium text-white shadow-xs"
                : "text-[#6e6c64] hover:text-[#1c1b18]"
            }`}
          >
            {lang === "UA" ? "Всі проєкти" : "All Projects"}
          </button>
        </div>
      </div>

      {/* TAB 1: Pending Projects */}
      {activeTab === "pending" && (
        <div className="space-y-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1c1b18]">
            {lang === "UA" ? "Нові ТЗ від клієнтів (очікують затвердження)" : "Incoming Client Briefs Awaiting Assignment"}
          </h2>

          {pendingProjects.length === 0 ? (
            <div className="rounded-sm border border-dashed border-[#e4e0d5] bg-white p-14 text-center font-mono text-xs text-[#8f8c82]">
              {lang === "UA" ? "Немає нових проєктів, що очікують призначення." : "No pending projects found."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingProjects.map((p) => (
                <div key={p.id} className="rounded-sm border border-[#e4e0d5] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="rounded-xs border border-[#e4e0d5] bg-[#f4f0e8] px-2 py-0.5 font-mono text-[10px] uppercase font-medium text-[#1c1b18]">
                        {lang === "UA" ? "Очікує призначення" : "Awaiting Designer"}
                      </span>
                      <h3 className="mt-2.5 font-serif text-xl font-normal text-[#1c1b18]">{p.title}</h3>
                    </div>
                    <span className="font-mono text-xs text-[#8f8c82]">
                      {new Date(p.created_at).toLocaleDateString(lang === "UA" ? "uk-UA" : "en-US")}
                    </span>
                  </div>

                  <div className="space-y-1.5 rounded-sm border border-[#e4e0d5] bg-[#faf8f5] p-4 text-xs font-mono text-[#4a4943]">
                    <p>
                      {lang === "UA" ? "Клієнт" : "Client"}: <span className="font-semibold text-[#1c1b18]">{p.client_name}</span> ({p.client_email})
                    </p>
                    <p>
                      {lang === "UA" ? "Тип" : "Type"}: {PROPERTY_TYPE_LABELS[p.property_type]?.[lang] || p.property_type} | {lang === "UA" ? "Площа" : "Area"}: {p.area} m²
                    </p>
                    <p className="pt-2 border-t border-[#e4e0d5]">
                      {lang === "UA" ? "ТЗ" : "Brief"}: {p.description || (lang === "UA" ? "Без опису" : "No description")}
                    </p>
                  </div>

                  {p.files && p.files.length > 0 && (
                    <div className="text-xs font-mono text-[#6e6c64]">
                      <span className="font-semibold text-[#1c1b18]">{lang === "UA" ? "Файли" : "Files"}: </span>
                      {p.files.map((f, i) =>
                        f.url ? (
                          <a
                            key={i}
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mr-3 text-[#1c1b18] underline hover:no-underline"
                          >
                            📎 {f.name}
                          </a>
                        ) : (
                          <span key={i} className="mr-3 text-[#8f8c82]">
                            📎 {f.name}
                          </span>
                        )
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#e4e0d5] flex justify-end">
                    <button
                      onClick={() => setAssignModalProject(p)}
                      className="cursor-pointer rounded-sm bg-[#1c1b18] px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#33312c]"
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

      {/* TAB 2: All Projects Table */}
      {activeTab === "all" && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center rounded-sm border border-[#e4e0d5] bg-white p-4 font-mono text-xs shadow-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-[#6e6c64]">{lang === "UA" ? "Статус:" : "Status:"}</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-sm border border-[#e4e0d5] bg-[#faf8f5] px-3 py-2 text-[#1c1b18] focus:border-[#1c1b18] focus:outline-none"
              >
                <option value="ALL">{lang === "UA" ? "Всі статуси" : "All Statuses"}</option>
                <option value="IN_PROGRESS">{lang === "UA" ? "В роботі" : "In Progress"}</option>
                <option value="IN_REVIEW">{lang === "UA" ? "На перевірці" : "In Review"}</option>
                <option value="COMPLETED">{lang === "UA" ? "Завершено" : "Completed"}</option>
                <option value="AWAITING_PAYMENT">{lang === "UA" ? "Очікує оплати" : "Awaiting Payment"}</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-[#6e6c64]">{lang === "UA" ? "Дизайнер:" : "Designer:"}</span>
              <select
                value={designerFilter}
                onChange={(e) => setDesignerFilter(e.target.value)}
                className="rounded-sm border border-[#e4e0d5] bg-[#faf8f5] px-3 py-2 text-[#1c1b18] focus:border-[#1c1b18] focus:outline-none"
              >
                <option value="ALL">{lang === "UA" ? "Всі дизайнери" : "All Designers"}</option>
                {designers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name || d.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Projects Table */}
          <div className="overflow-hidden rounded-sm border border-[#e4e0d5] bg-white shadow-xs">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-[#e4e0d5] bg-[#faf8f5] text-[#6e6c64]">
                <tr>
                  <th className="p-4">{lang === "UA" ? "Проєкт" : "Project"}</th>
                  <th className="p-4">{lang === "UA" ? "Клієнт" : "Client"}</th>
                  <th className="p-4">{lang === "UA" ? "Дизайнер" : "Designer"}</th>
                  <th className="p-4">{lang === "UA" ? "Площа" : "Area"}</th>
                  <th className="p-4">{lang === "UA" ? "Статус" : "Status"}</th>
                  <th className="p-4 text-right">{lang === "UA" ? "Перебіг подій" : "Timeline"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e0d5]">
                {filteredAllProjects.map((p) => {
                  const assignedDes = designers.find((d) => d.id === p.designer_id);
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-[#faf8f5]">
                      <td className="p-4 font-medium text-[#1c1b18]">
                        <div>{p.title}</div>
                        <div className="text-[10px] text-[#8f8c82]">ID: {p.id.slice(0, 8)}</div>
                      </td>
                      <td className="p-4 text-[#4a4943]">
                        <div>{p.client_name}</div>
                        <div className="text-[10px] text-[#8f8c82]">{p.client_email}</div>
                      </td>
                      <td className="p-4 text-[#4a4943]">
                        {assignedDes ? (
                          <span className="rounded-xs border border-[#e4e0d5] bg-[#f4f0e8] px-2 py-0.5 text-[#1c1b18]">
                            {assignedDes.full_name || assignedDes.email}
                          </span>
                        ) : (
                          <span className="text-[#8f8c82]">{lang === "UA" ? "Не призначено" : "Unassigned"}</span>
                        )}
                      </td>
                      <td className="p-4 text-[#1c1b18]">{p.area} м²</td>
                      <td className="p-4">
                        <select
                          value={p.status}
                          onChange={(e) => handleStatusChange(p.id, e.target.value as Project["status"])}
                          className="rounded-xs border border-[#e4e0d5] bg-[#faf8f5] px-2 py-1 text-[11px] text-[#1c1b18] focus:border-[#1c1b18] focus:outline-none"
                        >
                          <option value="PENDING_APPROVAL">{STATUS_LABELS.PENDING_APPROVAL[lang]}</option>
                          <option value="IN_PROGRESS">{STATUS_LABELS.IN_PROGRESS[lang]}</option>
                          <option value="IN_REVIEW">{STATUS_LABELS.IN_REVIEW[lang]}</option>
                          <option value="COMPLETED">{STATUS_LABELS.COMPLETED[lang]}</option>
                          <option value="AWAITING_PAYMENT">{STATUS_LABELS.AWAITING_PAYMENT[lang]}</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setDetailsProject(p)}
                          className="cursor-pointer rounded-xs border border-[#e4e0d5] bg-white px-3 py-1.5 text-[10px] uppercase font-medium text-[#1c1b18] hover:border-[#1c1b18] hover:bg-[#1c1b18] hover:text-white transition-colors"
                        >
                          {lang === "UA" ? "Історія →" : "Timeline →"}
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

      {/* MODAL: Assign Designer */}
      {assignModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1b18]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-6 rounded-sm border border-[#e4e0d5] bg-white p-8 text-[#1c1b18] shadow-2xl">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8f8c82]">
                {lang === "UA" ? "Затвердження ТЗ" : "Approve Brief"}
              </span>
              <h3 className="mt-1 font-serif text-2xl font-normal text-[#1c1b18]">
                {assignModalProject.title}
              </h3>
            </div>

            <form onSubmit={handleAssignDesigner} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-mono uppercase text-[#6e6c64]">
                  {lang === "UA" ? "Оберіть 3D-візуалізатора для проєкту:" : "Assign 3D Designer:"}
                </label>
                <select
                  required
                  value={selectedDesignerId}
                  onChange={(e) => setSelectedDesignerId(e.target.value)}
                  className="w-full rounded-sm border border-[#e4e0d5] bg-[#faf8f5] p-3 text-xs text-[#1c1b18] focus:border-[#1c1b18] focus:outline-none"
                >
                  <option value="">-- {lang === "UA" ? "Оберіть дизайнера" : "Select designer"} --</option>
                  {designers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name || d.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalProject(null)}
                  className="w-1/2 cursor-pointer rounded-sm border border-[#e4e0d5] py-3 text-xs font-medium uppercase tracking-wider text-[#6e6c64] hover:bg-[#faf8f5]"
                >
                  {lang === "UA" ? "Скасувати" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="w-1/2 cursor-pointer rounded-sm bg-[#1c1b18] py-3 text-xs font-medium uppercase tracking-wider text-white hover:bg-[#33312c]"
                >
                  {lang === "UA" ? "Підтвердити" : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Timeline & Details */}
      {detailsProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1c1b18]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl space-y-6 rounded-sm border border-[#e4e0d5] bg-white p-8 text-[#1c1b18] shadow-2xl my-8">
            <div className="flex items-start justify-between border-b border-[#e4e0d5] pb-4">
              <div>
                <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8f8c82]">
                  {lang === "UA" ? "Перебіг подій проєкту" : "Project Timeline"}
                </span>
                <h3 className="mt-1 font-serif text-2xl font-normal text-[#1c1b18]">
                  {detailsProject.title}
                </h3>
                <p className="mt-1 text-xs text-[#6e6c64]">
                  {lang === "UA" ? "Замовник" : "Client"}: {detailsProject.client_name}
                </p>
              </div>
              <button
                onClick={() => setDetailsProject(null)}
                className="cursor-pointer rounded-xs border border-[#e4e0d5] bg-[#faf8f5] px-3 py-1 text-xs text-[#1c1b18] hover:bg-[#1c1b18] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="rounded-sm border border-[#e4e0d5] bg-[#faf8f5] p-4 space-y-2">
                <span className="font-semibold text-[#1c1b18] block uppercase text-[10px] tracking-wider">
                  {lang === "UA" ? "1. Технічне завдання" : "1. Specifications"}
                </span>
                <p className="text-[#4a4943] leading-relaxed">
                  {detailsProject.description || (lang === "UA" ? "Опис відсутній." : "No brief provided.")}
                </p>
                {detailsProject.files && detailsProject.files.length > 0 && (
                  <div className="pt-2 border-t border-[#e4e0d5]">
                    <span className="text-[#8f8c82]">{lang === "UA" ? "Файли" : "Files"}: </span>
                    {detailsProject.files.map((f, i) =>
                      f.url ? (
                        <a
                          key={i}
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mr-3 text-[#1c1b18] underline hover:no-underline"
                        >
                          📎 {f.name}
                        </a>
                      ) : (
                        <span key={i} className="mr-3 text-[#8f8c82]">📎 {f.name}</span>
                      )
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-sm border border-[#e4e0d5] bg-[#faf8f5] p-4 space-y-2">
                <span className="font-semibold text-[#1c1b18] block uppercase text-[10px] tracking-wider">
                  {lang === "UA" ? "2. Історія рендерів" : "2. Renders History"}
                </span>
                {detailsProject.versions && detailsProject.versions.length > 0 ? (
                  <div className="space-y-2">
                    {detailsProject.versions.map((v) => (
                      <div key={v.id} className="flex justify-between rounded-xs bg-white p-2.5 border border-[#e4e0d5]">
                        <span className="font-medium text-[#1c1b18]">{v.version}: {v.comment}</span>
                        <span className="text-[#8f8c82]">{v.createdAt}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#8f8c82]">
                    {lang === "UA" ? "Дизайнер ще не завантажував версії рендерів." : "No render versions uploaded yet."}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-[#e4e0d5] pt-4">
              <button
                onClick={() => setDetailsProject(null)}
                className="cursor-pointer rounded-sm bg-[#1c1b18] px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-white hover:bg-[#33312c]"
              >
                {lang === "UA" ? "Закрити" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}