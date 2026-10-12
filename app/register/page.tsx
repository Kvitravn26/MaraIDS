"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { COUNTRY_CODES } from "@/lib/countryCodes";
import { useApp } from "@/context/AppContext";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { lang } = useApp();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCode, setSelectedCode] = useState("+380");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"client" | "designer">("client");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fullPhone = `${selectedCode} ${phone.trim()}`;

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            phone: fullPhone,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        if (role === "designer") {
          router.push("/designer/projects");
        } else {
          router.push("/client");
        }
      }
    } catch (err: unknown) {
      console.error("Помилка реєстрації:", err);
      const rawMessage = err instanceof Error ? err.message.toLowerCase() : "";
      const message = rawMessage.includes("already registered")
        ? lang === "UA"
          ? "Цей email уже зареєстрований. Увійдіть або використайте іншу адресу."
          : "This email is already registered. Sign in or use another address."
        : lang === "UA"
        ? "Помилка реєстрації. Перевірте введені дані та спробуйте ще раз."
        : "Registration failed. Check your details and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-5 pb-16 pt-32 text-[#1c1b18]">
      <div className="w-full max-w-lg space-y-7 rounded-sm border border-[#e4e0d5] bg-white p-8 shadow-sm sm:p-10">
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.24em] text-[#8f8c82]">
            MARA · DESIGN STUDIO
          </p>
          <h1 className="font-serif text-3xl font-normal text-[#1c1b18]">
            {lang === "UA" ? "Створити акаунт" : "Create an account"}
          </h1>
          <p className="mt-2 text-xs text-[#6e6c64]">
            {lang === "UA"
              ? "Оберіть тип доступу та заповніть контактні дані"
              : "Choose account type and enter your details"}
          </p>
        </div>

        {error && (
          <div className="rounded-sm border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
              {lang === "UA" ? "Тип доступу" : "Account Role"}
            </label>
            <div className="grid grid-cols-2 gap-1 rounded-sm border border-[#e4e0d5] bg-[#faf8f5] p-1 text-xs">
              <button
                type="button"
                onClick={() => setRole("client")}
                className={`cursor-pointer rounded-xs py-2.5 text-center font-medium transition-all ${
                  role === "client"
                    ? "bg-[#1c1b18] text-white shadow-xs"
                    : "text-[#6e6c64] hover:text-[#1c1b18]"
                }`}
              >
                {lang === "UA" ? "Замовник / Клієнт" : "Client"}
              </button>
              <button
                type="button"
                onClick={() => setRole("designer")}
                className={`cursor-pointer rounded-xs py-2.5 text-center font-medium transition-all ${
                  role === "designer"
                    ? "bg-[#1c1b18] text-white shadow-xs"
                    : "text-[#6e6c64] hover:text-[#1c1b18]"
                }`}
              >
                {lang === "UA" ? "3D-Візуалізатор" : "3D Designer"}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
              {lang === "UA" ? "Ім'я та Прізвище" : "Full Name"}
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={lang === "UA" ? "Наталія Кусик" : "Natalia Kusik"}
              className="w-full rounded-sm border border-[#e4e0d5] bg-[#faf8f5] px-4 py-3 text-xs text-[#1c1b18] focus:border-[#1c1b18] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
              {lang === "UA" ? "Номер телефону" : "Phone Number"}
            </label>
            <div className="flex gap-2">
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                className="max-w-[130px] truncate rounded-sm border border-[#e4e0d5] bg-[#faf8f5] px-2.5 py-3 text-[11px] font-mono text-[#1c1b18] focus:border-[#1c1b18] focus:bg-white focus:outline-none"
              >
                {COUNTRY_CODES.filter((c) => c.code !== "email").map((country) => (
                  <option key={country.code} value={country.code}>
                    {lang === "UA" ? country.ua : country.en}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="67 123 4567"
                className="w-full rounded-sm border border-[#e4e0d5] bg-[#faf8f5] px-4 py-3 text-xs font-mono text-[#1c1b18] focus:border-[#1c1b18] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-sm border border-[#e4e0d5] bg-[#faf8f5] px-4 py-3 text-xs text-[#1c1b18] focus:border-[#1c1b18] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#6e6c64]">
              {lang === "UA" ? "Пароль" : "Password"}
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-sm border border-[#e4e0d5] bg-[#faf8f5] px-4 py-3 text-xs text-[#1c1b18] focus:border-[#1c1b18] focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-3 w-full cursor-pointer rounded-sm bg-[#1c1b18] py-3.5 text-xs font-medium uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#33312c] disabled:opacity-50"
          >
            {loading
              ? lang === "UA"
                ? "Створення акаунту..."
                : "Creating account..."
              : lang === "UA"
              ? "Зареєструватися"
              : "Create Account"}
          </button>
        </form>

        <div className="border-t border-[#e4e0d5] pt-5 text-xs text-[#6e6c64]">
          {lang === "UA" ? "Вже зареєстровані?" : "Already have an account?"}{" "}
          <Link
            href="/login"
            className="font-medium text-[#1c1b18] underline underline-offset-4 hover:no-underline"
          >
            {lang === "UA" ? "Увійти" : "Sign in"}
          </Link>
        </div>
      </div>
    </main>
  );
}