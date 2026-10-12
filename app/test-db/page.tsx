"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/context/AppContext";

export default function TestDbPage() {
  const { lang } = useApp();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

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

        setStatus("success");
      } catch (err: unknown) {
        console.error("Помилка:", err);
        setStatus("error");
      }
    }

    testInsert();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#070708] px-5 py-12 text-white">
      <div className="w-full max-w-md space-y-4 border border-white/10 bg-zinc-900 p-8 text-center">
        <h1 className="text-lg font-medium">{lang === "UA" ? "Перевірка бази даних" : "Database check"}</h1>
        <p className="text-sm text-zinc-500">
          {status === "loading"
            ? lang === "UA" ? "Перевіряємо підключення..." : "Checking the connection..."
            : status === "success"
            ? lang === "UA" ? "Запис тестового ліда успішний." : "Test lead inserted successfully."
            : lang === "UA" ? "Не вдалося записати тестовий лід." : "Could not insert the test lead."}
        </p>
      </div>
    </main>
  );
}