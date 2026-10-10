"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Реєструємо і передаємо метадані для тригера бази даних
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (signUpError) throw signUpError;

      // Перенаправлення відповідно до ролі
      if (role === "designer") {
        router.push("/designer/projects");
      } else if (role === "admin") {
        router.push("/admin/leads");
      } else {
        router.push("/client");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Помилка при реєстрації");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070708] text-white flex items-center justify-center p-6 font-mono">
      <div className="max-w-md w-full bg-zinc-900 border border-white/10 p-8 rounded-xl space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-bold tracking-tight">Реєстрація</h1>
          <p className="text-xs text-zinc-400">Mara Design Studio</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Ваше ім'я</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2.5 text-sm text-white focus:outline-none focus:border-white/40"
              placeholder="Роман Кусік"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2.5 text-sm text-white focus:outline-none focus:border-white/40"
              placeholder="romkusik@gmail.com"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2.5 text-sm text-white focus:outline-none focus:border-white/40"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Оберіть роль</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2.5 text-sm text-white focus:outline-none focus:border-white/40 cursor-pointer"
            >
              <option value="client">Клієнт</option>
              <option value="designer">Дизайнер</option>
              <option value="admin">Адміністратор</option>
            </select>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold p-2.5 rounded text-xs hover:bg-zinc-200 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Створення акаунту..." : "Зареєструватися"}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-400 pt-2 border-t border-white/5">
          Вже є акаунт?{" "}
          <Link href="/login" className="text-white hover:underline font-medium">
            Увійти
          </Link>
        </div>
      </div>
    </main>
  );
}