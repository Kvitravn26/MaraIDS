"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LeadForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const project_details = formData.get("project_details") as string;

    try {
      const { error: insertError } = await supabase.from("leads").insert([
        {
          name,
          email,
          phone,
          contact: phone || email, // Заповнюємо обов'язкове поле contact
          project_details,
        },
      ]);

      if (insertError) throw insertError;

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md w-full bg-zinc-900 p-6 rounded-xl border border-white/10 text-white">
      <h2 className="text-lg font-bold">Обговорити проєкт</h2>
      
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Ваше ім'я</label>
        <input name="name" required className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm" />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Email</label>
        <input name="email" type="email" required className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm" />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Телефон</label>
        <input name="phone" className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm" />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Деталі проєкту</label>
        <textarea name="project_details" rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm" />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}
      {success && <p className="text-green-400 text-xs">Дякуємо! Заявку успішно надіслано.</p>}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-white text-black font-medium py-2 rounded text-sm hover:bg-zinc-200 transition"
      >
        {loading ? "Надсилання..." : "Надіслати заявку"}
      </button>
    </form>
  );
}