"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { PROJECT_FILES_BUCKET } from "@/lib/projectStorage";

type AttachmentKind = "file" | "render";

type ProjectAttachment = {
  name: string;
  path?: string;
  size?: string;
  contentType?: string;
  kind?: AttachmentKind;
  url?: string;
};

type ProjectMessage = {
  id: string;
  project_id: string;
  sender_id: string;
  body: string;
  attachments: ProjectAttachment[];
  created_at: string;
};

type ClientProject = {
  id: string;
  title: string;
  client_id: string;
  client_name: string;
  client_email: string;
  designer_id: string | null;
  status: string;
  area: number;
  property_type: string;
  description: string;
  files: ProjectAttachment[];
  created_at: string;
};

const STATUS_LABELS: Record<string, { UA: string; EN: string }> = {
  PENDING_APPROVAL: { UA: "На затвердженні", EN: "Pending approval" },
  AWAITING_DESIGNER: { UA: "Очікує дизайнера", EN: "Awaiting designer" },
  IN_PROGRESS: { UA: "В роботі", EN: "In progress" },
  IN_REVIEW: { UA: "На перевірці", EN: "In review" },
  COMPLETED: { UA: "Завершено", EN: "Completed" },
  AWAITING_PAYMENT: { UA: "Очікує оплати", EN: "Awaiting payment" },
};

const PROJECT_STEPS = ["PENDING_APPROVAL", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"];

async function signAttachments(attachments: ProjectAttachment[]) {
  return Promise.all(
    attachments.map(async (attachment) => {
      if (!attachment.path) return attachment;

      const { data, error } = await supabase.storage
        .from(PROJECT_FILES_BUCKET)
        .createSignedUrl(attachment.path, 60 * 60);

      if (error) {
        console.error("Не вдалося створити посилання на вкладення:", error);
        return attachment;
      }

      return { ...attachment, url: data.signedUrl };
    })
  );
}

async function loadProjectMessages(projectId: string) {
  const { data, error } = await supabase
    .from("client_project_messages")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const messages = await Promise.all(
    (data || []).map(async (message) => ({
      ...message,
      attachments: await signAttachments(
        (message.attachments as ProjectAttachment[] | null) || []
      ),
    }))
  );

  return messages as ProjectMessage[];
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }
  return "Не вдалося завантажити робочу зону. Спробуйте оновити сторінку.";
}

export default function ProjectWorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const { lang } = useApp();
  const [project, setProject] = useState<ClientProject | null>(null);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [messageText, setMessageText] = useState("");
  const [attachmentKind, setAttachmentKind] = useState<AttachmentKind>("file");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  useEffect(() => {
    let active = true;
    let refreshTimer: number | undefined;

    const loadWorkspace = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/login");
          return;
        }

        const [{ data: projectData, error: projectError }, { data: profile }] =
          await Promise.all([
            supabase
              .from("client_project_requests")
              .select("*")
              .eq("id", projectId)
              .single(),
            supabase
              .from("profiles")
              .select("role")
              .eq("id", user.id)
              .maybeSingle(),
          ]);

        if (projectError) throw projectError;
        if (!projectData) throw new Error("Проєкт не знайдено або немає доступу до нього.");

        const files = await signAttachments(
          (projectData.files as ProjectAttachment[] | null) || []
        );
        const loadedMessages = await loadProjectMessages(projectId);

        if (!active) return;

        setUserId(user.id);
        setUserRole(profile?.role || "client");
        setProject({ ...projectData, files } as ClientProject);
        setMessages(loadedMessages);

        refreshTimer = window.setInterval(() => {
          void loadProjectMessages(projectId)
            .then((nextMessages) => {
              if (active) setMessages(nextMessages);
            })
            .catch((messageError: unknown) => {
              console.error("Не вдалося оновити повідомлення:", messageError);
            });
        }, 8000);
      } catch (loadError) {
        if (active) setError(getErrorMessage(loadError));
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadWorkspace();

    return () => {
      active = false;
      if (refreshTimer) window.clearInterval(refreshTimer);
    };
  }, [projectId, router]);

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPendingFiles(Array.from(event.target.files || []));
  };

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!project || !userId || (!messageText.trim() && pendingFiles.length === 0)) return;

    setSending(true);
    setError("");
    const uploadedPaths: string[] = [];

    try {
      const attachments: ProjectAttachment[] = [];

      for (const file of pendingFiles) {
        const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${userId}/${project.id}/${crypto.randomUUID()}-${safeFilename}`;
        const { error: uploadError } = await supabase.storage
          .from(PROJECT_FILES_BUCKET)
          .upload(path, file, { contentType: file.type || "application/octet-stream" });

        if (uploadError) throw uploadError;
        uploadedPaths.push(path);
        attachments.push({
          name: file.name,
          path,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          contentType: file.type,
          kind: attachmentKind,
        });
      }

      const { error: messageError } = await supabase
        .from("client_project_messages")
        .insert({
          project_id: project.id,
          sender_id: userId,
          body: messageText.trim(),
          attachments,
        });

      if (messageError) throw messageError;

      setMessageText("");
      setPendingFiles([]);
      setMessages(await loadProjectMessages(project.id));
    } catch (sendError) {
      if (uploadedPaths.length > 0) {
        const { error: cleanupError } = await supabase.storage
          .from(PROJECT_FILES_BUCKET)
          .remove(uploadedPaths);
        if (cleanupError) console.error("Не вдалося прибрати вкладення:", cleanupError);
      }
      setError(getErrorMessage(sendError));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-xs font-mono text-zinc-500">
        {lang === "UA" ? "Завантаження робочої зони..." : "Loading project workspace..."}
      </main>
    );
  }

  if (!project) {
    return (
      <main className="pt-32 pb-20 px-6 max-w-3xl mx-auto text-white">
        <p className="rounded-lg border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-200">
          {error || (lang === "UA" ? "Проєкт недоступний." : "Project unavailable.")}
        </p>
        <Link href={userRole === "designer" ? "/designer/projects" : "/client"} className="mt-5 inline-block text-sm text-zinc-300 underline">
          {lang === "UA" ? "Повернутися до проєктів" : "Back to projects"}
        </Link>
      </main>
    );
  }

  const currentStep = Math.max(0, PROJECT_STEPS.indexOf(project.status));
  const renderAttachments = messages.flatMap((message) =>
    message.attachments.filter((attachment) => attachment.kind === "render")
  );
  const dateLocale = lang === "UA" ? "uk-UA" : "en-US";
  const projectsHref = userRole === "designer" ? "/designer/projects" : "/client";

  return (
    <main className="pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-white space-y-6">
      <Link href={projectsHref} className="text-xs font-mono text-zinc-400 hover:text-white">
        ← {lang === "UA" ? "Усі проєкти" : "All projects"}
      </Link>

      <section className="border-b border-white/10 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">
              {lang === "UA" ? "Робоча зона проєкту" : "Project workspace"}
            </p>
            <h1 className="mt-2 text-2xl font-semibold">{project.title}</h1>
            <p className="mt-2 text-xs text-zinc-400">
              {project.property_type === "apartment"
                ? lang === "UA" ? "Квартира" : "Apartment"
                : project.property_type === "commercial"
                ? lang === "UA" ? "Комерційне приміщення" : "Commercial space"
                : lang === "UA" ? "Будинок" : "House"}
              {` · ${project.area} м² · `}
              {new Date(project.created_at).toLocaleDateString(dateLocale)}
            </p>
          </div>
          <span className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs text-cyan-200">
            {STATUS_LABELS[project.status]?.[lang] || project.status}
          </span>
        </div>

        <ol className="mt-7 grid grid-cols-4 gap-2">
          {PROJECT_STEPS.map((step, index) => (
            <li key={step} className="min-w-0">
              <div className={`h-1 rounded-full ${index <= currentStep ? "bg-cyan-300" : "bg-white/10"}`} />
              <p className={`mt-2 text-[10px] leading-tight ${index <= currentStep ? "text-zinc-200" : "text-zinc-600"}`}>
                {STATUS_LABELS[step][lang]}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-200">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0 border border-white/10 bg-[#101012]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">{lang === "UA" ? "Обговорення" : "Discussion"}</h2>
              <p className="mt-1 text-[11px] text-zinc-500">
                {lang === "UA" ? "Повідомлення клієнта й дизайнера" : "Client and designer messages"}
              </p>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {userRole === "designer" ? "DESIGNER" : userRole === "admin" ? "ADMIN" : "CLIENT"}
            </span>
          </div>

          <div className="flex min-h-90 max-h-[58vh] flex-col gap-4 overflow-y-auto p-4 sm:p-5">
            {messages.length === 0 ? (
              <div className="m-auto max-w-sm py-12 text-center">
                <p className="text-sm text-zinc-300">
                  {lang === "UA" ? "Поки немає повідомлень" : "No messages yet"}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  {lang === "UA"
                    ? "Напишіть дизайнеру, щоб узгодити деталі проєкту."
                    : "Send your designer a message to discuss project details."}
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.sender_id === userId;
                const senderLabel = message.sender_id === project.client_id
                  ? project.client_name
                  : message.sender_id === project.designer_id
                  ? lang === "UA" ? "Дизайнер" : "Designer"
                  : lang === "UA" ? "Адміністратор" : "Administrator";

                return (
                  <article key={message.id} className={`max-w-[92%] ${isOwnMessage ? "ml-auto" : "mr-auto"}`}>
                    <div className="mb-1 flex items-center gap-2 text-[10px] text-zinc-500">
                      <span>{isOwnMessage ? (lang === "UA" ? "Ви" : "You") : senderLabel}</span>
                      <time>{new Date(message.created_at).toLocaleString(dateLocale, { dateStyle: "short", timeStyle: "short" })}</time>
                    </div>
                    <div className={`rounded-lg border px-3.5 py-3 ${isOwnMessage ? "border-cyan-300/20 bg-cyan-300/10" : "border-white/10 bg-black/40"}`}>
                      {message.body && <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-100">{message.body}</p>}
                      {message.attachments.length > 0 && (
                        <div className={`${message.body ? "mt-3" : ""} space-y-2`}>
                          {message.attachments.map((attachment) => (
                            <a
                              key={attachment.path || attachment.name}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between gap-4 border-t border-white/10 pt-2 text-xs text-zinc-200 hover:text-white"
                            >
                              <span className="min-w-0 truncate">{attachment.kind === "render" ? "▧" : "↗"} {attachment.name}</span>
                              <span className="shrink-0 text-[10px] text-zinc-500">{attachment.size}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendMessage} className="border-t border-white/10 bg-black/20 p-4 sm:p-5">
            <textarea
              rows={3}
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              placeholder={lang === "UA" ? "Напишіть повідомлення..." : "Write a message..."}
              className="w-full resize-y rounded-md border border-white/10 bg-black/50 p-3 text-sm text-white placeholder:text-zinc-600 focus:border-cyan-200/50 focus:outline-none"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAttachmentKind("file")}
                  className={`rounded-md border px-3 py-2 text-xs ${attachmentKind === "file" ? "border-white/40 bg-white/10 text-white" : "border-white/10 text-zinc-400 hover:text-white"}`}
                >
                  {lang === "UA" ? "Файл" : "File"}
                </button>
                <button
                  type="button"
                  onClick={() => setAttachmentKind("render")}
                  className={`rounded-md border px-3 py-2 text-xs ${attachmentKind === "render" ? "border-white/40 bg-white/10 text-white" : "border-white/10 text-zinc-400 hover:text-white"}`}
                >
                  {lang === "UA" ? "Рендер" : "Render"}
                </button>
                <label className="cursor-pointer rounded-md border border-white/10 px-3 py-2 text-xs text-zinc-300 hover:border-white/30 hover:text-white">
                  {lang === "UA" ? "Додати вкладення" : "Attach files"}
                  <input
                    type="file"
                    multiple
                    accept={attachmentKind === "render" ? "image/png,image/jpeg,image/webp" : ".pdf,.dwg,.zip,.jpg,.jpeg,.png,.webp"}
                    onChange={handleFileSelection}
                    className="sr-only"
                  />
                </label>
                {pendingFiles.length > 0 && (
                  <span className="max-w-44 truncate text-[10px] text-zinc-500">
                    {pendingFiles.map((file) => file.name).join(", ")}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={sending || (!messageText.trim() && pendingFiles.length === 0)}
                className="rounded-md bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sending ? (lang === "UA" ? "Надсилання..." : "Sending...") : (lang === "UA" ? "Надіслати" : "Send")}
              </button>
            </div>
          </form>
        </section>

        <aside className="space-y-5">
          <section className="border border-white/10 bg-[#101012]">
            <div className="border-b border-white/10 px-4 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-300">
                {lang === "UA" ? "Файли проєкту" : "Project files"}
              </h2>
            </div>
            <div className="space-y-2 p-4">
              {project.files.length === 0 ? (
                <p className="text-xs text-zinc-500">{lang === "UA" ? "Файлів ще немає" : "No files yet"}</p>
              ) : (
                project.files.map((file) => (
                  <a
                    key={file.path || file.name}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 border-b border-white/5 py-2 text-xs hover:text-cyan-100"
                  >
                    <span className="min-w-0 truncate">↗ {file.name}</span>
                    <span className="shrink-0 text-[10px] text-zinc-600">{file.size}</span>
                  </a>
                ))
              )}
            </div>
          </section>

          <section className="border border-white/10 bg-[#101012]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-300">
                {lang === "UA" ? "Рендери" : "Renders"}
              </h2>
              <span className="text-[10px] font-mono text-zinc-500">{renderAttachments.length}</span>
            </div>
            {renderAttachments.length === 0 ? (
              <p className="p-4 text-xs text-zinc-500">
                {lang === "UA" ? "Дизайнер ще не додав рендери" : "No renders have been shared yet"}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 p-3">
                {renderAttachments.map((render) => (
                  <a
                    key={render.path || render.name}
                    href={render.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group overflow-hidden border border-white/10 bg-black/40"
                  >
                    {render.url ? (
                      <div
                        role="img"
                        aria-label={render.name}
                        className="aspect-square w-full bg-cover bg-center transition group-hover:opacity-80"
                        style={{ backgroundImage: `url("${render.url}")` }}
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center text-xs text-zinc-500">{render.name}</div>
                    )}
                    <span className="block truncate px-2 py-1.5 text-[10px] text-zinc-400">{render.name}</span>
                  </a>
                ))}
              </div>
            )}
          </section>

          <section className="border border-white/10 bg-[#101012] p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-300">
              {lang === "UA" ? "Технічне завдання" : "Project brief"}
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-zinc-400">
              {project.description || (lang === "UA" ? "Опис не додано." : "No description provided.")}
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
