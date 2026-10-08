"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestDbPage() {
  const [status, setStatus] = useState<string>("Тестування запису в базу...");

  useEffect(() => {
    async function testInsert() {
      try {
        // Додаємо поле contact, яке вимагає база даних
        const { error } = await supabase.from("leads").insert([
          {
            name: "Тестовий Клієнт",
            email: "test@example.com",
            phone: "+380000000000",
            contact: "+380000000000", // Заповнюємо обов'язкове поле contact
            project_details: "Тестування підключення Supabase",
          },
        ]);

        if (error) {
          throw error;
        }

        setStatus("Успішно! Тестовий лід успішно записано в базу даних через RLS!");
      } catch (err: any) {
        console.error("Помилка:", err);
        setStatus(`Помилка запису: ${err.message}`);
      }
    }

    testInsert();
  }, []);

  return (
    <div className="min-h-screen bg-[#070708] text-white flex flex-col items-center justify-center p-6 font-mono">
      <div className="bg-zinc-900 border border-white/10 p-8 rounded-xl max-w-md w-full text-center space-y-4">
        <h1 className="text-lg font-bold">Тест бази даних Supabase</h1>
        <p className="text-sm text-zinc-400">{status}</p>
      </div>
    </div>
  );
}