"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { PROJECT_FILES_BUCKET } from "@/lib/projectStorage";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const { lang } = useApp();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    propertyType: "apartment",
    area: "85",
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
        await fetch("/api/telegram", {
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
      } catch (notificationError) {
        console.error("Помилка Telegram-сповіщення:", notificationError);
      }

      alert(
        lang === "UA"
          ? "Проєкт успішно створено та надіслано в студію!"
          : "Project created and submitted successfully!"
      );

      router.push("/client");
    } catch (err) {
      if (uploadedFiles.length > 0) {
        await supabase.storage
          .from(PROJECT_FILES_BUCKET)
          .remove(uploadedFiles.map((file) => file.path));
      }

      console.error("Помилка створення проєкту:", err);
      setError(
        lang === "UA"
          ? "Не вдалося зберегти проєкт. Перевірте дані та спробуйте ще раз."
          : "Could not save the project. Please check the fields and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 pb-20 pt-32 text-[#1c1b18] sm:px-8">
      <Link href="/client" className="mb-6 inline-block font-mono text-xs text-[#8f8c82] hover:text-[#1c1b18]">
        ← {lang === "UA" ? "Повернутися до кабінету" : "Back to Dashboard"}
      </Link>

      <div className="mb-8 border-b border-[#e4e0d5] pb-6">
        <h1 className="font-serif text-3xl font-normal text-[#1c1b18]">
          {lang === "UA" ? "Створення нового проєкту" : "Create New Project Brief"}
        </h1>
        <p className="mt-2 text-xs text-[#6e6c64]">
          {lang === "UA"
            ? "Заповніть технічне завдання та завантажте робочі креслення (DWG, PDF), планування або референси."
            : "Outline your project specifications and attach floor plans (DWG, PDF) or inspiration references."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-7 rounded-sm border border-[#e4e0d5] bg-white p-8 sm:p-10 shadow-xs"
      >
        {error && (
          <div className="rounded-sm border border-red-200 bg-red-50 p-4 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
              {lang === "UA" ? "Назва проєкту / Об'єкта" : "Project Title"}
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={
                lang === "UA"
                  ? "Наприклад: Квартира у ЖК 'Печерськ' — 120 м²"
                  : "e.g. Modern Apartment on Main St — 120 sq m"
              }
              className="w-full rounded-sm border border-[#e4e0d5] bg-[#faf8f5] px-4 py-3 text-xs text-[#1c1b18] focus:border-[#1c1b18] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
                {lang === "UA" ? "Тип приміщення" : "Property Type"}
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full rounded-sm border border-[#e4e0d5] bg-[#faf8f5] px-4 py-3 text-xs text-[#1c1b18] focus:border-[#1c1b18] focus:bg-white focus:outline-none"
              >
                <option value="apartment">{lang === "UA" ? "Квартира / Апартаменти" : "Apartment / Flat"}</option>
                <option value="house">{lang === "UA" ? "Будинок / Резиденція" : "House / Villa"}</option>
                <option value="commercial">{lang === "UA" ? "Комерційне приміщення" : "Commercial Space"}</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
                {lang === "UA" ? "Площа (м²)" : "Area (sq m)"}
              </label>
              <input
                type="number"
                required
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full rounded-sm border border-[#e4e0d5] bg-[#faf8f5] px-4 py-3 font-mono text-xs text-[#1c1b18] focus:border-[#1c1b18] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
              {lang === "UA" ? "Технічне завдання & Побажання щодо стилю" : "Project Brief & Style Guidelines"}
            </label>
            <textarea
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={
                lang === "UA"
                  ? "Опишіть бажані матеріали (натуральний камінь, дуб, текстиль), світлові сценарії або особливості проєктування..."
                  : "Describe desired materials (limestone, oak, textured plaster), lighting scenarios, or unique requirements..."
              }
              className="w-full resize-none rounded-sm border border-[#e4e0d5] bg-[#faf8f5] p-4 text-xs leading-relaxed text-[#1c1b18] focus:border-[#1c1b18] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
              {lang === "UA"
                ? "Креслення та референси (DWG, PDF, ZIP, JPG, PNG)"
                : "Drawings & Reference Files (DWG, PDF, ZIP, JPG, PNG)"}
            </label>
            <div className="rounded-sm border-2 border-dashed border-[#e4e0d5] bg-[#faf8f5] p-8 text-center transition-colors hover:border-[#1c1b18]/40">
              <input
                type="file"
                multiple
                accept=".dwg,.pdf,.zip,.jpg,.png"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="block cursor-pointer space-y-2">
                <div className="text-xs font-medium text-[#1c1b18]">
                  {lang === "UA"
                    ? "Натисніть для вибору файлів або перетягніть їх сюди"
                    : "Click to select files or drag and drop"}
                </div>
                <div className="font-mono text-[10px] text-[#8f8c82]">
                  DWG, PDF, ZIP, JPG, PNG (до 50 МБ)
                </div>
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {files.map((f, i) => (
                  <p key={i} className="truncate font-mono text-xs text-[#4a4943]">
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
          className="w-full cursor-pointer rounded-sm bg-[#1c1b18] py-4 text-xs font-medium uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#33312c] disabled:opacity-50"
        >
          {loading
            ? lang === "UA"
              ? "Завантаження проєкту..."
              : "Uploading project..."
            : lang === "UA"
            ? "Надіслати проєкт у роботу студії"
            : "Submit Project to Studio"}
        </button>
      </form>
    </div>
  );
}