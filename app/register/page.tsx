"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { COUNTRY_CODES } from "@/lib/countryCodes";

export default function RegisterPage() {
  const router = useRouter();

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
      // Передаємо full_name та role у user_metadata
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
        // Редирект залежно від ролі
        if (role === "designer") {
          router.push("/designer/projects");
        } else {
          router.push("/client");
        }
      }
    } catch (err: unknown) {
      console.error("Помилка реєстрації:", err);
      setError(err instanceof Error ? err.message : "Помилка при реєстрації. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
      <div className="bg-[#121214] border border-white/10 p-8 rounded-3xl max-w-md w-full space-y-6 text-white font-sans">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Реєстрація акаунту</h1>
          <p className="text-xs text-zinc-400 mt-1">Оберіть роль та заповніть дані для входу</p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-500/30 text-red-200 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-mono tracking-widest text-zinc-400 mb-2">
              Тип акаунту
            </label>
            <div className="grid grid-cols-2 gap-2 bg-black p-1 rounded-xl border border-white/10 font-mono text-xs">
              <button
                type="button"
                onClick={() => setRole("client")}
                className={`py-2.5 rounded-lg transition text-center cursor-pointer ${
                  role === "client" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
                }`}
              >
                👤 Замовник
              </button>
              <button
                type="button"
                onClick={() => setRole("designer")}
                className={`py-2.5 rounded-lg transition text-center cursor-pointer ${
                  role === "designer" ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
                }`}
              >
                🎨 Дизайнер
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-widest text-zinc-400 mb-1.5">
              Ім&apos;я та Прізвище
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nata Kusik"
              className="w-full bg-black/60 border border-white/10 px-4 py-3 text-xs text-white rounded-xl focus:border-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-widest text-zinc-400 mb-1.5">
              Номер телефону
            </label>
            <div className="flex gap-2">
              <select
                value={selectedCode}
                onChange={(e) => setSelectedCode(e.target.value)}
                aria-label="Код країни"
                className="bg-black/60 border border-white/10 px-2 py-3 text-[11px] text-white rounded-xl focus:border-white focus:outline-none font-mono max-w-[145px]"
              >
                {COUNTRY_CODES.filter((country) => country.code !== "email").map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.ua}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="67 123 4567"
                autoComplete="tel-national"
                className="w-full min-w-0 bg-black/60 border border-white/10 px-4 py-3 text-xs text-white rounded-xl focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-widest text-zinc-400 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="romkusik@gmail.com"
              className="w-full bg-black/60 border border-white/10 px-4 py-3 text-xs text-white rounded-xl focus:border-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-mono tracking-widest text-zinc-400 mb-1.5">
              Пароль
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black/60 border border-white/10 px-4 py-3 text-xs text-white rounded-xl focus:border-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider hover:bg-zinc-200 transition cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? "Створення акаунту..." : "Зареєструватися"}
          </button>
        </form>
      </div>
    </div>
  );
}