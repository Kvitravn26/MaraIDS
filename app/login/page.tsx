"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const { lang } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Authorize via Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // 2. Query role from profiles table
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError) throw profileError;

        // 3. Route according to role
        if (profile?.role === "admin") {
          router.push("/admin/projects");
        } else if (profile?.role === "designer") {
          router.push("/designer/projects");
        } else {
          router.push("/client");
        }

        router.refresh();
      }
    } catch (err: unknown) {
      const rawMessage =
        typeof err === "object" && err !== null && "message" in err && typeof err.message === "string"
          ? err.message.toLowerCase()
          : "";
      const message = rawMessage.includes("email not confirmed")
        ? lang === "UA"
          ? "Підтвердьте email перед входом."
          : "Please confirm your email before signing in."
        : lang === "UA"
        ? "Не вдалося увійти. Перевірте email і пароль."
        : "Could not sign in. Please verify your email and password.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-5 pb-16 pt-32 text-[#1c1b18]">
      <div className="w-full max-w-md space-y-8 rounded-sm border border-[#e4e0d5] bg-white p-8 shadow-sm sm:p-10">
        <div className="space-y-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#8f8c82]">
            MARA · DESIGN STUDIO
          </p>
          <h1 className="font-serif text-3xl font-normal text-[#1c1b18]">
            {lang === "UA" ? "Вхід до кабінету" : "Sign in to workspace"}
          </h1>
          <p className="text-xs text-[#6e6c64]">
            {lang === "UA"
              ? "Особистий кабінет клієнта, дизайнера та студії"
              : "Dedicated client, designer, and studio portal"}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-sm border border-[#e4e0d5] bg-[#faf8f5] px-4 py-3 text-xs text-[#1c1b18] focus:border-[#1c1b18] focus:bg-white focus:outline-none"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
                {lang === "UA" ? "Пароль" : "Password"}
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-sm border border-[#e4e0d5] bg-[#faf8f5] px-4 py-3 text-xs text-[#1c1b18] focus:border-[#1c1b18] focus:bg-white focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-sm border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-sm bg-[#1c1b18] py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#33312c] disabled:opacity-50"
          >
            {loading
              ? lang === "UA"
                ? "Авторизація..."
                : "Signing in..."
              : lang === "UA"
              ? "Увійти в кабінет"
              : "Sign in"}
          </button>
        </form>

        <div className="border-t border-[#e4e0d5] pt-5 text-xs text-[#6e6c64]">
          {lang === "UA" ? "Ще немає акаунта?" : "Don't have an account yet?"}{" "}
          <Link
            href="/register"
            className="font-medium text-[#1c1b18] underline underline-offset-4 hover:no-underline"
          >
            {lang === "UA" ? "Зареєструватися" : "Create an account"}
          </Link>
        </div>
      </div>
    </main>
  );
}