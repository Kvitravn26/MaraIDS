"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (authError) throw authError;

      window.location.href = "/login";
    } catch (err: any) {
      setError(err.message || "Помилка реєстрації");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070708] text-white flex items-center justify-center p-6 font-mono">
      <div className="bg-zinc-900 border border-white/10 p-8 rounded-xl max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold tracking-tight">Реєстрація акаунта</h1>
          <p className="text-xs text-zinc-400">Mara Design Studio</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Ім'я та Прізвище</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm text-white focus:outline-none focus:border-white/40"
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
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm text-white focus:outline-none focus:border-white/40"
              placeholder="example@gmail.com"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm text-white focus:outline-none focus:border-white/40"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Роль у системі</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm text-white focus:outline-none focus:border-white/40"
            >
              <option value="client">Клієнт (Client)</option>
              <option value="designer">Дизайнер (Designer)</option>
            </select>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-medium py-2 rounded text-sm hover:bg-zinc-200 transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Створення акаунта..." : "Зареєструватися"}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 pt-2 border-t border-white/10">
          Вже є акаунт?{" "}
          <Link href="/login" className="text-white hover:underline">
            Увійти
          </Link>
        </div>
      </div>
    </main>
  );
}