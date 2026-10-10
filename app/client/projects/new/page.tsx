"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { PROJECT_FILES_BUCKET } from "@/lib/projectStorage";

export default function NewProjectPage() {
  const router = useRouter();
  const { lang } = useApp();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    propertyType: "apartment",
    area: "80",
    description: "",
  });

  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fileNamesList =
      files.length > 0
        ? files.map((f) => f.name).join(", ")
        : "Файли не завантажено";
    const uploadedFiles: { name: string; path: string; size: string }[] = [];

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.email) {
        throw new Error("Не вдалося визначити авторизованого клієнта.");
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      const projectId = crypto.randomUUID();
      for (const file of files) {
        const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${user.id}/${projectId}/${crypto.randomUUID()}-${safeFilename}`;
        const { error: uploadError } = await supabase.storage
          .from(PROJECT_FILES_BUCKET)
          .upload(path, file, { contentType: file.type || "application/octet-stream" });

        if (uploadError) throw uploadError;

        uploadedFiles.push({
          name: file.name,
          path,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        });
      }

      const { error: projectError } = await supabase.from("client_project_requests").insert({
        id: projectId,
        client_id: user.id,
        title: formData.title.trim(),
        client_name: profile?.full_name || user.user_metadata?.full_name || user.email,
        client_email: user.email,
        status: "PENDING_APPROVAL",
        area: Number(formData.area),
        property_type: formData.propertyType,
        description: formData.description,
        files: uploadedFiles,
        versions: [],
      });

      if (projectError) throw projectError;

      try {
        const response = await fetch("/api/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: profile?.full_name || user.user_metadata?.full_name || user.email,
            contact: user.email,
            propertyType:
              formData.propertyType === "apartment"
                ? "Квартира"
                : formData.propertyType === "house"
                ? "Будинок"
                : "Комерція",
            area: formData.area,
            message: `🆕 НОВИЙ ПРОЄКТ З КАБІНЕТУ КЛІЄНТА!\n\n📌 Назва: ${formData.title}\n📐 Площа: ${formData.area} м²\n📝 ТЗ / Побажання: ${formData.description || "без коментарів"}\n📎 Файли (${files.length} шт): ${fileNamesList}`,
          }),
        });

        if (!response.ok) {
          console.error("Не вдалося надіслати Telegram-сповіщення про проєкт.");
        }
      } catch (notificationError) {
        console.error("Помилка Telegram-сповіщення:", notificationError);
      }

      alert(
        lang === "UA"
          ? "Проєкт успішно створено та надіслано в студію!"
          : "Project created and sent successfully!"
      );
      
      router.push("/client");
    } catch (err) {
      if (uploadedFiles.length > 0) {
        const { error: cleanupError } = await supabase.storage
          .from(PROJECT_FILES_BUCKET)
          .remove(uploadedFiles.map((file) => file.path));

        if (cleanupError) {
          console.error("Не вдалося видалити файли після помилки:", cleanupError);
        }
      }

      console.error("Помилка створення проєкту:", err);
      const errorMessage =
        typeof err === "object" && err !== null && "message" in err && typeof err.message === "string"
          ? err.message
          : "";
      const normalizedErrorMessage = errorMessage.toLowerCase();
      const userErrorMessage = normalizedErrorMessage.includes("bucket not found")
        ? lang === "UA"
          ? "Сховище файлів не налаштоване. Виконайте supabase/setup-project-files.sql у Supabase SQL Editor."
          : "File storage is not configured. Run supabase/setup-project-files.sql in the Supabase SQL Editor."
        : normalizedErrorMessage.includes("row-level security") ||
          normalizedErrorMessage.includes("permission denied")
        ? lang === "UA"
          ? "Supabase заблокував доступ за правилами RLS. Перевірте політики доступу до projects і Storage."
          : "Supabase blocked access through RLS. Check the projects and Storage access policies."
        : errorMessage ||
          (lang === "UA"
            ? "Помилка при збереженні проєкту. Спробуйте ще раз."
            : "Failed to create project. Please try again.");

      setError(
        userErrorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-16 px-6 max-w-3xl mx-auto text-white">
      <div className="border-b border-white/10 pb-6 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          {lang === "UA" ? "Створення нового проєкту" : "Create New Project"}
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          {lang === "UA"
            ? "Заповніть ТЗ та завантажте робочі креслення (DWG/PDF), план обмірів або референси."
            : "Fill in the specs and upload drawings (DWG/PDF) or references."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-[#121214] border border-white/5 p-8 rounded-2xl space-y-6"
      >
        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-200 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-mono tracking-widest text-zinc-400 mb-2">
              {lang === "UA" ? "Назва проєкту / Об'єкта" : "Project Title"}
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={
                lang === "UA"
                  ? "Наприклад: ЖК 'Печерськ' — Квартира 120 м²"
                  : "e.g. Apartment 120 sq m"
              }
              className="w-full bg-black/50 border border-white/10 px-4 py-3 text-xs text-white rounded-xl focus:border-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-zinc-400 mb-2">
                {lang === "UA" ? "Тип приміщення" : "Property Type"}
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full bg-black border border-white/10 px-4 py-3 text-xs text-white rounded-xl focus:border-white focus:outline-none"
              >
                <option value="apartment">{lang === "UA" ? "Квартира" : "Apartment"}</option>
                <option value="house">{lang === "UA" ? "Будинок / Котедж" : "House"}</option>
                <option value="commercial">{lang === "UA" ? "Комерційне приміщення" : "Commercial"}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-widest text-zinc-400 mb-2">
                {lang === "UA" ? "Площа (м²)" : "Area (sq m)"}
              </label>
              <input
                type="number"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full bg-black/50 border border-white/10 px-4 py-3 text-xs text-white rounded-xl focus:border-white focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-widest text-zinc-400 mb-2">
              {lang === "UA" ? "Деталі ТЗ / Коментарі до стилю" : "Project Details / Style Specs"}
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={
                lang === "UA"
                  ? "Вкажіть ваші побажання щодо матеріалів, освітлення, гами та особливих деталей..."
                  : "Describe preferences regarding materials, lighting, colors..."
              }
              className="w-full bg-black/50 border border-white/10 p-4 text-xs text-white rounded-xl focus:border-white focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-widest text-zinc-400 mb-2">
              {lang === "UA"
                ? "Креслення та референси (DWG, PDF, ZIP, JPG)"
                : "Drawings & References (DWG, PDF, ZIP, JPG)"}
            </label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-white/30 transition cursor-pointer bg-black/30">
              <input
                type="file"
                multiple
                accept=".dwg,.pdf,.zip,.jpg,.png"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                <div className="text-zinc-400 text-xs">
                  {lang === "UA"
                    ? "Клацніть для вибору файлів або перетягніть їх сюди"
                    : "Click to select files or drag & drop here"}
                </div>
                <div className="text-[10px] text-zinc-600 font-mono">
                  DWG, PDF, ZIP, PNG, JPG
                </div>
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-3 space-y-1">
                {files.map((f, i) => (
                  <p key={i} className="text-xs font-mono text-zinc-400 truncate">
                    📎 {f.name} ({(f.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-semibold py-4 rounded-xl text-xs uppercase tracking-wider hover:bg-zinc-200 transition cursor-pointer disabled:opacity-50"
        >
          {loading
            ? lang === "UA"
              ? "Надсилання..."
              : "Sending..."
            : lang === "UA"
            ? "Надіслати проєкт у роботу"
            : "Submit Project"}
        </button>
      </form>
    </div>
  );
}