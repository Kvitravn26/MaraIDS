"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) {
        console.error("Не вдалося завантажити профіль:", profileError);
      }

      const role = profile?.role || "client";

      if (role === "admin") {
        window.location.href = "/admin/leads";
      } else if (role === "designer") {
        window.location.href = "/designer/projects";
      } else {
        window.location.href = "/client";
      }
    } catch (err: any) {
      setError(err.message || "Помилка входу");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#070708] text-white flex items-center justify-center p-6 font-mono">
      <div className="bg-zinc-900 border border-white/10 p-8 rounded-xl max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold tracking-tight">Вхід у систему</h1>
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
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-sm text-white focus:outline-none focus:border-white/40"
              placeholder="admin@example.com"
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

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-medium py-2 rounded text-sm hover:bg-zinc-200 transition disabled:opacity-50"
          >
            {loading ? "Вхід..." : "Увійти"}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 pt-2 border-t border-white/10">
          Немає облікового запису?{" "}
          <Link href="/register" className="text-white hover:underline">
            Зареєструватися
          </Link>
        </div>
      </div>
    </main>
  );
}