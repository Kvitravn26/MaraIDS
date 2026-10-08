"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DesignerDashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <main className="min-h-screen bg-[#070708] text-white p-8 font-mono">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Кабінет Дизайнера</h1>
            <p className="text-xs text-zinc-400">Авторизовано як: {userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs bg-zinc-800 border border-zinc-700 px-3 py-2 rounded hover:bg-zinc-700 transition"
          >
            Вийти
          </button>
        </div>

        <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl">
          <p className="text-xs text-zinc-400">Тут будуть проєкти, призначені для візуалізації та роботи над етапами.</p>
        </div>
      </div>
    </main>
  );
}