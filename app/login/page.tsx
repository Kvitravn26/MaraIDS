"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Авторизація через Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // 2. Отримуємо роль користувача з таблиці profiles
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError) throw profileError;

        // 3. Перенаправляємо залежно від ролі
        if (profile?.role === "admin") {
          router.push("/admin/leads");
        } else if (profile?.role === "designer") {
          router.push("/designer/projects");
        } else {
          router.push("/client");
        }

        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Помилка при вході. Перевірте email та пароль.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070708] text-white flex items-center justify-center p-6 font-mono">
      <div className="max-w-md w-full bg-zinc-900 border border-white/10 p-8 rounded-xl space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-bold tracking-tight">Вхід до кабінету</h1>
          <p className="text-xs text-zinc-400">Mara Design Studio</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold p-2.5 rounded text-xs hover:bg-zinc-200 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? "Вхід..." : "Увійти"}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-400 pt-2 border-t border-white/5">
          Ще немає акаунта?{" "}
          <Link href="/register" className="text-white hover:underline font-medium">
            Зареєструватися
          </Link>
        </div>
      </div>
    </main>
  );
}