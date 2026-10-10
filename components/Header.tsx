"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const { lang, setLang, currency, setCurrency } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [dashboardUrl, setDashboardUrl] = useState<string>("/client");

  // Перевіряємо, чи користувач зараз у кабінеті (шлях починається з /client, /designer або /admin)
  const isInDashboard = pathname.startsWith("/client") || pathname.startsWith("/designer") || pathname.startsWith("/admin");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = profile?.role || "client";
        if (role === "admin") setDashboardUrl("/admin/projects");
        else if (role === "designer") setDashboardUrl("/designer/projects");
        else setDashboardUrl("/client");
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUser();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Логотип тепер веде на головну сторінку */}
        <Link 
          href="/" 
          className="flex items-center gap-3.5 group cursor-pointer"
        >
          <img 
            src="/logo.png" 
            alt="Mara Design Studio Logo" 
            className="h-21 w-auto object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity" 
          />
        </Link>

        {/* Навігація (показуємо тільки на головній або за потребою) */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-light tracking-widest text-zinc-400 uppercase">
          <a href="/#projects" className="hover:text-white transition-colors">
            {lang === "UA" ? "Проєкти" : "Projects"}
          </a>
          <a href="/#services" className="hover:text-white transition-colors">
            {lang === "UA" ? "Послуги" : "Services"}
          </a>
          <a href="/#about" className="hover:text-white transition-colors">
            {lang === "UA" ? "Про студію" : "About"}
          </a>
          <a href="/#contact" className="hover:text-white transition-colors">
            {lang === "UA" ? "Контакти" : "Contact"}
          </a>
        </nav>

        {/* Правий блок: Перемикач валют, мови та кнопки аутентифікації */}
        <div className="flex items-center gap-6">
          
          {/* Перемикач валют */}
          <div className="flex items-center gap-2 text-xs font-mono">
            {(["UAH", "USD", "EUR"] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`cursor-pointer transition-colors px-1.5 py-0.5 ${
                  currency === curr ? "text-white font-medium bg-white/10" : "text-zinc-600 hover:text-zinc-400"
                }`}
              >
                {curr === "UAH" ? "₴" : curr === "USD" ? "$" : "€"}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-zinc-800"></div>

          {/* Перемикач мови */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <button
              onClick={() => setLang("UA")}
              className={`cursor-pointer transition-colors ${
                lang === "UA" ? "text-white font-medium" : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              UA
            </button>
            <span className="text-zinc-700">/</span>
            <button
              onClick={() => setLang("EN")}
              className={`cursor-pointer transition-colors ${
                lang === "EN" ? "text-white font-medium" : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              EN
            </button>
          </div>

          <div className="h-4 w-[1px] bg-zinc-800"></div>

          {/* Динамічні кнопки авторизації */}
          <div className="flex items-center gap-3 font-mono text-xs">
            {user ? (
              isInDashboard ? (
                // Якщо користувач у кабінеті — кнопка ВИХІД
                <button
                  onClick={handleLogout}
                  className="bg-zinc-800 text-white font-medium px-3.5 py-1.5 rounded hover:bg-zinc-700 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  {lang === "UA" ? "Вихід" : "Logout"}
                </button>
              ) : (
                // Якщо залогінений, але на головній — кнопка КАБІНЕТ
                <Link
                  href={dashboardUrl}
                  className="bg-white text-black font-medium px-3.5 py-1.5 rounded hover:bg-zinc-200 transition-colors uppercase tracking-wider"
                >
                  {lang === "UA" ? "Кабінет" : "Dashboard"}
                </Link>
              )
            ) : (
              // Якщо не залогінений — кнопка УВІЙТИ
              <Link
                href="/login"
                className="bg-white text-black font-medium px-4 py-1.5 rounded hover:bg-zinc-200 transition-colors uppercase tracking-wider"
              >
                {lang === "UA" ? "Увійти" : "Login"}
              </Link>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}