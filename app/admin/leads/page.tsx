"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Lead = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  service_type: string;
  status: string;
  budget?: string;
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err: any) {
      setError(err.message || "Помилка завантаження лідів");
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
    } catch (err: any) {
      alert("Помилка оновлення статусу: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070708] text-white flex items-center justify-center font-mono text-sm">
        Завантаження лідів...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#070708] text-white p-8 font-mono">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Управління лідами</h1>
            <p className="text-xs text-zinc-400">Mara Design Studio — Адмін-панель</p>
          </div>
          <Link
            href="/admin/projects"
            className="text-xs bg-zinc-800 border border-zinc-700 px-3 py-2 rounded hover:bg-zinc-700 transition"
          >
            Перейти до проєктів →
          </Link>
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-800/50 text-zinc-400 border-b border-white/10">
                <tr>
                  <th className="p-4">Дата</th>
                  <th className="p-4">Клієнт</th>
                  <th className="p-4">Контакти</th>
                  <th className="p-4">Послуга</th>
                  <th className="p-4">Бюджет</th>
                  <th className="p-4">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-zinc-500">
                      Жодного ліда поки немає.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-zinc-800/30 transition">
                      <td className="p-4 text-zinc-400">
                        {new Date(lead.created_at).toLocaleDateString("uk-UA")}
                      </td>
                      <td className="p-4 font-medium">{lead.full_name}</td>
                      <td className="p-4 text-zinc-400">
                        <div>{lead.email}</div>
                        <div>{lead.phone}</div>
                      </td>
                      <td className="p-4 text-zinc-300">{lead.service_type}</td>
                      <td className="p-4 text-zinc-400">{lead.budget || "—"}</td>
                      <td className="p-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          className="bg-zinc-800 border border-zinc-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-white/40"
                        >
                          <option value="new">New (Новий)</option>
                          <option value="contacted">Contacted (Зв'язалися)</option>
                          <option value="in_progress">In Progress (В роботі)</option>
                          <option value="converted">Converted (Конвертовано)</option>
                          <option value="archived">Archived (Архів)</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}