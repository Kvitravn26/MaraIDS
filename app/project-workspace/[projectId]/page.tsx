"use client";

import { useEffect, useState, Suspense } from "react";
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
  round?: string;
  comment?: string;
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

type RenderItem = ProjectAttachment & {
  messageId: string;
  messageBody?: string;
  createdAt: string;
  senderLabel: string;
  round: string;
  comment?: string;
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

function getErrorMessage(error: unknown, lang: "UA" | "EN") {
  const rawMessage =
    typeof error === "object" && error !== null && "message" in error
      ? String(error.message).toLowerCase()
      : "";

  if (rawMessage.includes("permission") || rawMessage.includes("row-level security")) {
    return lang === "UA"
      ? "Немає доступу до цього проєкту. Перевірте, чи ви увійшли у відповідний акаунт."
      : "You do not have access to this project. Check that you are signed into the correct account.";
  }

  return lang === "UA"
    ? "Не вдалося завантажити робочу зону. Спробуйте оновити сторінку."
    : "Could not load the project workspace. Please refresh the page.";
}

export default function ProjectWorkspacePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-7xl px-5 pb-20 pt-32 font-mono text-xs text-[#8f8c82]">
          Loading workspace...
        </main>
      }
    >
      <ProjectWorkspaceContent />
    </Suspense>
  );
}

function ProjectWorkspaceContent() {
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

  // Round & comments state for renders
  const [renderRound, setRenderRound] = useState<string>("1.0");
  const [renderRoundComment, setRenderRoundComment] = useState<string>("");
  const [selectedRoundFilter, setSelectedRoundFilter] = useState<string>("ALL");

  // Lightbox modal for renders
  const [activeLightboxRender, setActiveLightboxRender] = useState<RenderItem | null>(null);

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
        if (!projectData) throw new Error("Проєкт не знайдено або немає доступу.");

        const files = await signAttachments(
          (projectData.files as ProjectAttachment[] | null) || []
        );
        const loadedMessages = await loadProjectMessages(projectId);

        if (!active) return;

        setUserId(user.id);
        setUserRole(profile?.role || "client");
        setProject({ ...projectData, files } as ClientProject);
        setMessages(loadedMessages);

        // Compute next proposed round (e.g. if 1.0 exists, default next to 2.0)
        let maxRound = 1;
        loadedMessages.forEach((m) => {
          (m.attachments || []).forEach((a) => {
            if (a.kind === "render" && a.round) {
              const num = parseFloat(a.round);
              if (!isNaN(num) && num >= maxRound) {
                maxRound = Math.floor(num) + 1;
              }
            }
          });
        });
        setRenderRound(`${maxRound}.0`);

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
        console.error("Помилка завантаження робочої зони:", loadError);
        if (active) setError(getErrorMessage(loadError, lang));
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadWorkspace();

    return () => {
      active = false;
      if (refreshTimer) window.clearInterval(refreshTimer);
    };
  }, [projectId, router, lang]);

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
          round: attachmentKind === "render" ? renderRound.trim() || "1.0" : undefined,
          comment:
            attachmentKind === "render"
              ? renderRoundComment.trim() || messageText.trim() || undefined
              : undefined,
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
      setRenderRoundComment("");
      setPendingFiles([]);
      const updatedMessages = await loadProjectMessages(project.id);
      setMessages(updatedMessages);

      // Increment round recommendation
      if (attachmentKind === "render") {
        const currentNum = parseFloat(renderRound);
        if (!isNaN(currentNum)) {
          setRenderRound(`${Math.floor(currentNum) + 1}.0`);
        }
      }
    } catch (sendError) {
      console.error("Помилка надсилання повідомлення:", sendError);
      if (uploadedPaths.length > 0) {
        await supabase.storage
          .from(PROJECT_FILES_BUCKET)
          .remove(uploadedPaths);
      }
      setError(getErrorMessage(sendError, lang));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-32 font-mono text-xs text-[#8f8c82]">
        {lang === "UA" ? "Завантаження робочої зони проєкту..." : "Loading project workspace..."}
      </main>
    );
  }

  if (!project) {
    return (
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-32 text-[#1c1b18]">
        <p className="rounded-sm border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          {error || (lang === "UA" ? "Проєкт недоступний." : "Project unavailable.")}
        </p>
        <Link
          href={userRole === "designer" ? "/designer/projects" : "/client"}
          className="mt-5 inline-block text-xs font-mono text-[#1c1b18] underline"
        >
          {lang === "UA" ? "← Повернутися до списку проєктів" : "← Back to projects"}
        </Link>
      </main>
    );
  }

  const currentStep = Math.max(0, PROJECT_STEPS.indexOf(project.status));
  const dateLocale = lang === "UA" ? "uk-UA" : "en-US";
  const projectsHref = userRole === "designer" ? "/designer/projects" : "/client";

  // Group and structure all renders by round
  let autoRoundCounter = 1;
  const allRenders: RenderItem[] = [];

  messages.forEach((msg) => {
    const rendersInMsg = (msg.attachments || []).filter((att) => att.kind === "render");
    if (rendersInMsg.length > 0) {
      const explicitRound = rendersInMsg.find((r) => r.round)?.round;
      const roundTag = explicitRound || `${autoRoundCounter}.0`;

      rendersInMsg.forEach((att) => {
        allRenders.push({
          ...att,
          messageId: msg.id,
          messageBody: msg.body,
          createdAt: msg.created_at,
          senderLabel:
            msg.sender_id === project.client_id
              ? project.client_name
              : lang === "UA" ? "Дизайнер" : "Designer",
          round: att.round || roundTag,
          comment: att.comment || msg.body || "",
        });
      });

      if (!explicitRound) {
        autoRoundCounter++;
      }
    }
  });

  // Extract distinct rounds for filter tabs
  const distinctRounds = Array.from(new Set(allRenders.map((r) => r.round))).sort(
    (a, b) => parseFloat(a) - parseFloat(b)
  );

  // Group renders by round
  const groupedRendersByRound: Record<string, RenderItem[]> = {};
  allRenders.forEach((item) => {
    if (!groupedRendersByRound[item.round]) {
      groupedRendersByRound[item.round] = [];
    }
    groupedRendersByRound[item.round].push(item);
  });

  const filteredRounds =
    selectedRoundFilter === "ALL"
      ? distinctRounds
      : distinctRounds.filter((r) => r === selectedRoundFilter);

  return (
    <main className="mx-auto max-w-7xl px-5 pb-20 pt-32 text-[#1c1b18] space-y-8 sm:px-8">
      <Link href={projectsHref} className="inline-block font-mono text-xs text-[#8f8c82] hover:text-[#1c1b18]">
        ← {lang === "UA" ? "Всі проєкти" : "All Projects"}
      </Link>

      {/* Project Status Banner */}
      <section className="rounded-sm border border-[#e4e0d5] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#8f8c82]">
              {lang === "UA" ? "Робоча зона об'єкта" : "Project Workspace"}
            </span>
            <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-normal text-[#1c1b18]">
              {project.title}
            </h1>
            <p className="mt-2 text-xs text-[#6e6c64]">
              {project.property_type === "apartment"
                ? lang === "UA" ? "Квартира" : "Apartment"
                : project.property_type === "commercial"
                ? lang === "UA" ? "Комерційне приміщення" : "Commercial space"
                : lang === "UA" ? "Будинок" : "House"}
              {` · ${project.area} м² · `}
              {new Date(project.created_at).toLocaleDateString(dateLocale)}
            </p>
          </div>

          <span className="rounded-xs border border-[#e4e0d5] bg-[#f4f0e8] px-3.5 py-1.5 font-mono text-xs font-medium text-[#1c1b18]">
            {STATUS_LABELS[project.status]?.[lang] || project.status}
          </span>
        </div>

        {/* Milestone Steps Bar */}
        <ol className="mt-8 grid grid-cols-4 gap-3 border-t border-[#e4e0d5] pt-6">
          {PROJECT_STEPS.map((step, index) => (
            <li key={step} className="min-w-0">
              <div
                className={`h-1.5 rounded-full transition-colors ${
                  index <= currentStep ? "bg-[#1c1b18]" : "bg-[#e4e0d5]"
                }`}
              />
              <p
                className={`mt-2 text-[10px] font-medium leading-tight ${
                  index <= currentStep ? "text-[#1c1b18]" : "text-[#8f8c82]"
                }`}
              >
                {STATUS_LABELS[step][lang]}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {error && (
        <p className="rounded-sm border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
          {error}
        </p>
      )}

      {/* Main Grid: Discussion Chat + Side Assets */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Chat / Collaboration Section */}
        <section className="flex flex-col rounded-sm border border-[#e4e0d5] bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-[#e4e0d5] px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#1c1b18]">
                {lang === "UA" ? "Обговорення та ітерації" : "Discussion & Iterations"}
              </h2>
              <p className="mt-0.5 text-[11px] text-[#6e6c64]">
                {lang === "UA"
                  ? "Прямий діалог між замовником та візуалізатором"
                  : "Direct dialogue between client and 3D visualizer"}
              </p>
            </div>
            <span className="rounded-xs bg-[#f4f0e8] px-2.5 py-1 font-mono text-[10px] uppercase font-medium text-[#1c1b18]">
              {userRole === "designer"
                ? lang === "UA" ? "Дизайнер" : "Designer"
                : userRole === "admin"
                ? lang === "UA" ? "Адміністратор" : "Admin"
                : lang === "UA" ? "Клієнт" : "Client"}
            </span>
          </div>

          {/* Message List */}
          <div className="flex min-h-[380px] max-h-[60vh] flex-col gap-4 overflow-y-auto p-5 sm:p-6 bg-[#faf8f5]/60">
            {messages.length === 0 ? (
              <div className="m-auto max-w-sm py-12 text-center">
                <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-[#f4f0e8] text-base">
                  💬
                </div>
                <p className="text-sm font-medium text-[#1c1b18]">
                  {lang === "UA" ? "Повідомлень ще немає" : "No messages yet"}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#6e6c64]">
                  {lang === "UA"
                    ? "Напишіть коментар до ТЗ або прикріпіть нові рендери з номером раунду, щоб розпочати діалог."
                    : "Share a comment regarding the brief or attach renders with a round tag to start the conversation."}
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.sender_id === userId;
                const senderLabel =
                  message.sender_id === project.client_id
                    ? project.client_name
                    : message.sender_id === project.designer_id
                    ? lang === "UA" ? "Дизайнер" : "Designer"
                    : lang === "UA" ? "Адміністратор" : "Admin";

                // Check if message has renders with rounds
                const renderAttachmentsInMsg = message.attachments.filter((a) => a.kind === "render");
                const roundBadge = renderAttachmentsInMsg[0]?.round;
                const roundComment = renderAttachmentsInMsg[0]?.comment;

                return (
                  <article
                    key={message.id}
                    className={`max-w-[88%] ${isOwnMessage ? "ml-auto" : "mr-auto"}`}
                  >
                    <div className="mb-1 flex items-center gap-2 text-[10px] font-mono text-[#8f8c82]">
                      <span className="font-medium text-[#1c1b18]">
                        {isOwnMessage ? (lang === "UA" ? "Ви" : "You") : senderLabel}
                      </span>
                      <span>·</span>
                      <time>
                        {new Date(message.created_at).toLocaleString(dateLocale, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </time>
                      {roundBadge && (
                        <span className="rounded-xs border border-[#1c1b18]/20 bg-[#1c1b18] px-1.5 py-0.2 text-[9px] font-mono uppercase text-white">
                          {lang === "UA" ? `Раунд ${roundBadge}` : `Round ${roundBadge}`}
                        </span>
                      )}
                    </div>

                    <div
                      className={`rounded-sm border p-4 text-xs leading-relaxed ${
                        isOwnMessage
                          ? "border-[#1c1b18] bg-[#1c1b18] text-white shadow-xs"
                          : "border-[#e4e0d5] bg-white text-[#1c1b18] shadow-xs"
                      }`}
                    >
                      {roundComment && roundComment !== message.body && (
                        <div className={`mb-2.5 rounded-xs p-2 text-[11px] font-mono ${isOwnMessage ? "bg-white/10 text-white" : "bg-[#f4f0e8] text-[#1c1b18]"}`}>
                          📌 {lang === "UA" ? `Коментар до раунду ${roundBadge || ""}:` : `Notes for Round ${roundBadge || ""}:`} {roundComment}
                        </div>
                      )}

                      {message.body && <p className="whitespace-pre-wrap">{message.body}</p>}

                      {message.attachments.length > 0 && (
                        <div className={`${message.body || roundComment ? "mt-3 pt-3 border-t" : ""} ${isOwnMessage ? "border-white/20" : "border-[#e4e0d5]"} space-y-2`}>
                          {message.attachments.map((att) => (
                            <div
                              key={att.path || att.name}
                              className="flex items-center justify-between gap-4 font-mono text-[11px]"
                            >
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`truncate underline hover:no-underline ${
                                  isOwnMessage ? "text-white/90" : "text-[#1c1b18]"
                                }`}
                              >
                                {att.kind === "render" ? "🖼️" : "📎"} {att.name}
                                {att.round && ` (Раунд ${att.round})`}
                              </a>
                              <span className="shrink-0 opacity-70">{att.size}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Message Input Box with Round Tagger */}
          <form onSubmit={handleSendMessage} className="border-t border-[#e4e0d5] bg-white p-5 space-y-3.5">
            <textarea
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={lang === "UA" ? "Напишіть повідомлення чи побажання до раунду..." : "Write a message or notes for this round..."}
              className="w-full resize-y rounded-sm border border-[#e4e0d5] bg-[#faf8f5] p-3 text-xs text-[#1c1b18] placeholder:text-[#8f8c82] focus:border-[#1c1b18] focus:bg-white focus:outline-none"
            />

            {/* If user selects "Рендер (CGI)", show Round Number & Round Comment inputs */}
            {attachmentKind === "render" && (
              <div className="rounded-sm border border-[#e4e0d5] bg-[#f4f0e8]/80 p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
                      {lang === "UA" ? "Номер раунду рендерів:" : "Render Round / Version:"}
                    </span>
                    <input
                      type="text"
                      value={renderRound}
                      onChange={(e) => setRenderRound(e.target.value)}
                      placeholder="1.0"
                      className="w-16 rounded-xs border border-[#e4e0d5] bg-white px-2 py-1 font-mono text-xs font-semibold text-[#1c1b18] text-center focus:border-[#1c1b18] focus:outline-none"
                    />
                  </div>

                  {/* Quick Round buttons */}
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span className="text-[#8f8c82]">{lang === "UA" ? "Швидкий вибір:" : "Quick:"}</span>
                    {["1.0", "1.1", "2.0", "2.1", "3.0"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRenderRound(r)}
                        className={`cursor-pointer rounded-xs px-2 py-0.5 border ${
                          renderRound === r
                            ? "bg-[#1c1b18] text-white border-[#1c1b18]"
                            : "bg-white text-[#6e6c64] border-[#e4e0d5] hover:text-[#1c1b18]"
                        }`}
                      >
                        v{r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={renderRoundComment}
                    onChange={(e) => setRenderRoundComment(e.target.value)}
                    placeholder={
                      lang === "UA"
                        ? "Коментар до цього раунду (напр. 'Змінено світловий сценарій та колір дерева')"
                        : "Round notes (e.g. 'Updated lighting scenario & oak tone')"
                    }
                    className="w-full rounded-xs border border-[#e4e0d5] bg-white px-3 py-2 text-xs text-[#1c1b18] placeholder:text-[#8f8c82] focus:border-[#1c1b18] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAttachmentKind("file")}
                  className={`cursor-pointer rounded-xs border px-3 py-1.5 text-xs font-mono transition-colors ${
                    attachmentKind === "file"
                      ? "border-[#1c1b18] bg-[#1c1b18] text-white"
                      : "border-[#e4e0d5] bg-white text-[#6e6c64] hover:text-[#1c1b18]"
                  }`}
                >
                  {lang === "UA" ? "Файл / Креслення" : "File / DWG"}
                </button>
                <button
                  type="button"
                  onClick={() => setAttachmentKind("render")}
                  className={`cursor-pointer rounded-xs border px-3 py-1.5 text-xs font-mono transition-colors ${
                    attachmentKind === "render"
                      ? "border-[#1c1b18] bg-[#1c1b18] text-white font-medium"
                      : "border-[#e4e0d5] bg-white text-[#6e6c64] hover:text-[#1c1b18]"
                  }`}
                >
                  {lang === "UA" ? "Рендер (CGI) + Раунд" : "Render (CGI) + Round"}
                </button>
                <label className="cursor-pointer rounded-xs border border-[#e4e0d5] bg-white px-3 py-1.5 text-xs text-[#6e6c64] hover:border-[#1c1b18] hover:text-[#1c1b18]">
                  {lang === "UA" ? "+ Вибрати файли" : "+ Select files"}
                  <input
                    type="file"
                    multiple
                    accept={
                      attachmentKind === "render"
                        ? "image/png,image/jpeg,image/webp"
                        : ".pdf,.dwg,.zip,.jpg,.jpeg,.png,.webp"
                    }
                    onChange={handleFileSelection}
                    className="sr-only"
                  />
                </label>
                {pendingFiles.length > 0 && (
                  <span className="max-w-[180px] truncate font-mono text-[10px] text-[#6e6c64]">
                    {pendingFiles.map((f) => f.name).join(", ")}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={sending || (!messageText.trim() && pendingFiles.length === 0)}
                className="cursor-pointer rounded-sm bg-[#1c1b18] px-6 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#33312c] disabled:opacity-40"
              >
                {sending
                  ? lang === "UA"
                    ? "Надсилання..."
                    : "Sending..."
                  : lang === "UA"
                  ? "Надіслати"
                  : "Send"}
              </button>
            </div>
          </form>
        </section>

        {/* Right Sidebar: Structured Rounds & Versions of Renders */}
        <aside className="space-y-6">
          {/* Renders Section Grouped by Round */}
          <section className="rounded-sm border border-[#e4e0d5] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#e4e0d5] pb-3">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1c1b18]">
                  {lang === "UA" ? "Версії рендерів" : "Render Rounds & Versions"}
                </h3>
                <p className="mt-0.5 text-[10px] text-[#8f8c82]">
                  {lang === "UA" ? "Поділ за ітераціями правок" : "Organized by revision rounds"}
                </p>
              </div>
              <span className="font-mono text-xs font-medium text-[#1c1b18]">
                {allRenders.length} {lang === "UA" ? "кадрів" : "frames"}
              </span>
            </div>

            {/* Round Filter Tabs */}
            {distinctRounds.length > 1 && (
              <div className="mt-3.5 flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => setSelectedRoundFilter("ALL")}
                  className={`cursor-pointer rounded-xs px-2 py-1 transition-all ${
                    selectedRoundFilter === "ALL"
                      ? "bg-[#1c1b18] text-white"
                      : "bg-[#faf8f5] text-[#6e6c64] border border-[#e4e0d5] hover:text-[#1c1b18]"
                  }`}
                >
                  {lang === "UA" ? "Усі" : "All"} ({allRenders.length})
                </button>
                {distinctRounds.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRoundFilter(r)}
                    className={`cursor-pointer rounded-xs px-2 py-1 transition-all ${
                      selectedRoundFilter === r
                        ? "bg-[#1c1b18] text-white"
                        : "bg-[#faf8f5] text-[#6e6c64] border border-[#e4e0d5] hover:text-[#1c1b18]"
                    }`}
                  >
                    {lang === "UA" ? `Раунд ${r}` : `Round ${r}`} ({groupedRendersByRound[r]?.length || 0})
                  </button>
                ))}
              </div>
            )}

            {/* Display Renders Grouped by Round */}
            {allRenders.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-[#f4f0e8] text-base">
                  🖼️
                </div>
                <p className="text-xs text-[#8f8c82]">
                  {lang === "UA"
                    ? "Візуалізації ще не завантажені"
                    : "No renders uploaded yet"}
                </p>
                <p className="mt-1 text-[11px] text-[#8f8c82]">
                  {lang === "UA"
                    ? "Дизайнер може надсилати чернетки рендерів із позначкою раунду через чат."
                    : "Renders can be uploaded with round annotations via the discussion box."}
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-6">
                {filteredRounds.map((roundKey) => {
                  const rendersInRound = groupedRendersByRound[roundKey] || [];
                  const sampleRender = rendersInRound[0];

                  return (
                    <div key={roundKey} className="rounded-xs border border-[#e4e0d5] bg-[#faf8f5] p-3.5 space-y-3">
                      {/* Round Header */}
                      <div className="flex items-start justify-between border-b border-[#e4e0d5] pb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-xs bg-[#1c1b18] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase text-white">
                              {lang === "UA" ? `Раунд ${roundKey}` : `Round ${roundKey}`}
                            </span>
                            <span className="font-mono text-[10px] text-[#8f8c82]">
                              {rendersInRound.length} {lang === "UA" ? "кадри" : "frames"}
                            </span>
                          </div>

                          {sampleRender?.comment && (
                            <p className="mt-1.5 text-[11px] leading-relaxed text-[#4a4943]">
                              💬 <span className="italic">{sampleRender.comment}</span>
                            </p>
                          )}
                        </div>

                        <span className="shrink-0 font-mono text-[10px] text-[#8f8c82]">
                          {new Date(sampleRender.createdAt).toLocaleDateString(dateLocale)}
                        </span>
                      </div>

                      {/* 2-column thumbnails grid */}
                      <div className="grid grid-cols-2 gap-2.5">
                        {rendersInRound.map((render, idx) => (
                          <div
                            key={render.path || `${render.name}-${idx}`}
                            onClick={() => setActiveLightboxRender(render)}
                            className="group cursor-pointer overflow-hidden rounded-xs border border-[#e4e0d5] bg-white transition-all hover:border-[#1c1b18] hover:shadow-xs"
                          >
                            <div className="relative aspect-square w-full overflow-hidden bg-[#ece8de]">
                              {render.url ? (
                                <img
                                  src={render.url}
                                  alt={render.name}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center p-2 text-center font-mono text-[10px] text-[#8f8c82]">
                                  {render.name}
                                </div>
                              )}
                              <div className="absolute right-1.5 top-1.5 rounded-xs bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-white backdrop-blur-xs">
                                v{render.round}
                              </div>
                            </div>
                            <div className="p-2">
                              <span className="block truncate font-mono text-[10px] font-medium text-[#1c1b18]">
                                {render.name}
                              </span>
                              <span className="block text-[9px] text-[#8f8c82]">
                                {lang === "UA" ? "Натисніть для огляду ↗" : "Click to view ↗"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Project Files Schedule */}
          <section className="rounded-sm border border-[#e4e0d5] bg-white p-5 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1c1b18]">
              {lang === "UA" ? "Файли та креслення" : "Project Files & Blueprints"}
            </h3>
            <div className="mt-3 space-y-2">
              {project.files.length === 0 ? (
                <p className="text-xs text-[#8f8c82]">
                  {lang === "UA" ? "Креслення не завантажено" : "No files attached yet"}
                </p>
              ) : (
                project.files.map((file) => (
                  <a
                    key={file.path || file.name}
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 border-b border-[#e4e0d5] py-2 text-xs text-[#1c1b18] hover:underline"
                  >
                    <span className="truncate">↗ {file.name}</span>
                    <span className="shrink-0 font-mono text-[10px] text-[#8f8c82]">{file.size}</span>
                  </a>
                ))
              )}
            </div>
          </section>

          {/* Brief Specification */}
          <section className="rounded-sm border border-[#e4e0d5] bg-white p-5 shadow-xs">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1c1b18]">
              {lang === "UA" ? "Технічне завдання (ТЗ)" : "Brief Specifications"}
            </h3>
            <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-[#6e6c64]">
              {project.description || (lang === "UA" ? "Опис не додано." : "No description provided.")}
            </p>
          </section>
        </aside>
      </div>

      {/* LIGHTBOX MODAL: High-Res Render View with Round info and Notes */}
      {activeLightboxRender && (
        <div
          onClick={() => setActiveLightboxRender(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1b18]/80 p-3 sm:p-6 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-sm border border-[#e4e0d5] bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e4e0d5] px-6 py-4 bg-[#faf8f5]">
              <div className="flex items-center gap-3">
                <span className="rounded-xs bg-[#1c1b18] px-2.5 py-1 font-mono text-xs font-semibold text-white uppercase">
                  {lang === "UA" ? `Раунд ${activeLightboxRender.round}` : `Round ${activeLightboxRender.round}`}
                </span>
                <span className="font-mono text-sm font-medium text-[#1c1b18] truncate max-w-sm">
                  {activeLightboxRender.name}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {activeLightboxRender.url && (
                  <a
                    href={activeLightboxRender.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="cursor-pointer rounded-xs border border-[#e4e0d5] bg-white px-3 py-1.5 font-mono text-xs text-[#1c1b18] hover:bg-[#1c1b18] hover:text-white transition-colors"
                  >
                    {lang === "UA" ? "Завантажити HD ↗" : "Download HD ↗"}
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setActiveLightboxRender(null)}
                  className="flex size-8 cursor-pointer items-center justify-center rounded-xs border border-[#e4e0d5] bg-white text-sm text-[#1c1b18] hover:bg-[#1c1b18] hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* High-Res Image Display */}
            <div className="flex flex-1 items-center justify-center overflow-auto bg-[#141412] p-2 sm:p-4 min-h-[400px] max-h-[70vh]">
              {activeLightboxRender.url ? (
                <img
                  src={activeLightboxRender.url}
                  alt={activeLightboxRender.name}
                  className="max-h-[66vh] w-auto max-w-full object-contain"
                />
              ) : (
                <p className="text-xs text-white/60">Зображення недоступне</p>
              )}
            </div>

            {/* Modal Footer with Comments */}
            <div className="border-t border-[#e4e0d5] px-6 py-4 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
              <div>
                <span className="font-medium text-[#1c1b18]">
                  {lang === "UA" ? "Коментар до раунду:" : "Round notes:"}{" "}
                </span>
                <span className="text-[#6e6c64]">
                  {activeLightboxRender.comment ||
                    activeLightboxRender.messageBody ||
                    (lang === "UA" ? "Без коментаря" : "No notes")}
                </span>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-[#8f8c82]">
                {lang === "UA" ? "Завантажено:" : "Uploaded:"}{" "}
                {new Date(activeLightboxRender.createdAt).toLocaleString(dateLocale)}
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
