"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Lead = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  project_details: string;
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const { data, error } = await supabase
          .from("leads")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setLeads(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] text-white flex items-center justify-center font-mono">
        <p className="text-zinc-400">Завантаження лідів...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070708] text-white flex items-center justify-center font-mono">
        <p className="text-red-400">Помилка завантаження: {error}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#070708] text-white p-8 md:p-12 font-mono">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <h1 className="text-xl font-bold">Панель управління: Вхідні ліди</h1>
          <span className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full border border-white/10">
            Всього: {leads.length}
          </span>
        </div>

        {leads.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/50 rounded-xl border border-white/10">
            <p className="text-zinc-500 text-sm">Поки що немає жодної заявки.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {leads.map((lead) => (
              <div 
                key={lead.id} 
                className="bg-zinc-900 border border-white/10 p-5 rounded-xl space-y-3 hover:border-white/20 transition"
              >
                <div className="flex justify-between items-start text-xs text-zinc-400">
                  <span className="font-semibold text-white text-sm">{lead.name}</span>
                  <span>{new Date(lead.created_at).toLocaleString("uk-UA")}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-zinc-300">
                  <div><span className="text-zinc-500">Email:</span> {lead.email || "—"}</div>
                  <div><span className="text-zinc-500">Телефон:</span> {lead.phone || "—"}</div>
                </div>

                {lead.project_details && (
                  <div className="text-xs bg-zinc-950 p-3 rounded border border-white/5 text-zinc-300">
                    <span className="text-zinc-500 block mb-1">Деталі проєкту:</span>
                    {lead.project_details}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}