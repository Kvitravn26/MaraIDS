"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Зчитуємо дані з калькулятора з URL
  const calcData = {
    service: searchParams.get("service") || "3D-Візуалізація",
    area: searchParams.get("area") || "80",
    price: searchParams.get("price") || "0",
    currency: searchParams.get("currency") || "UAH",
  };

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Реєстрація користувача в Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: "client" },
        },
      });

      if (authError) throw authError;
      const user = authData.user;

      if (user) {
        // 2. Зберігаємо параметри розрахунку з калькулятора у таблицю проєктів/лідів
        const { error: projectError } = await supabase.from("projects").insert([
          {
            client_id: user.id,
            service_type: calcData.service,
            area: Number(calcData.area),
            budget: Number(calcData.price),
            currency: calcData.currency,
            status: "pending", // новий лід / проєкт на розгляді
          },
        ]);

        if (projectError) {
          console.error("Помилка збереження проєкту:", projectError.message);
        }
      }

      // 3. Перенаправлення у кабінет клієнта
      router.push("/client");
    } catch (err: any) {
      alert("Помилка реєстрації: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] text-white flex items-center justify-center p-6 font-mono">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 p-8 rounded-2xl space-y-6">
        
        <div>
          <h1 className="text-xl font-bold tracking-tight">Реєстрація замовника</h1>
          {calcData.price !== "0" && (
            <div className="mt-3 p-3 bg-zinc-800/50 border border-white/5 rounded-xl text-xs space-y-1 text-zinc-300">
              <p className="text-white font-semibold">Обраний розрахунок:</p>
              <p>{calcData.service} — {calcData.area} м²</p>
              <p className="text-emerald-400 font-bold">Сума: {Number(calcData.price).toLocaleString()} {calcData.currency}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Ім'я та Прізвище</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white"
              placeholder="Nata Kusik"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Пароль</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-3.5 rounded-xl text-xs hover:bg-zinc-200 transition cursor-pointer"
          >
            {loading ? "Створення облікового запису..." : "Завершити оформлення"}
          </button>
        </form>

      </div>
    </div>
  );
}

// Обгортка у Suspense обов'язкова для Next.js App Router при використанні useSearchParams
export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070708] text-white flex items-center justify-center font-mono">Завантаження...</div>}>
      <RegisterForm />
    </Suspense>
  );
}