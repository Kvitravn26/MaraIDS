"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const { lang, setLang, currency, setCurrency } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [dashboardUrl, setDashboardUrl] = useState<string>("/client");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if inside dashboard
  const isInDashboard =
    pathname.startsWith("/client") ||
    pathname.startsWith("/designer") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/project-workspace");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e4e0d5] bg-[#faf8f5]/92 text-[#1c1b18] shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Mara Design Studio"
            className="h-11 w-auto object-contain brightness-0 opacity-85 transition-opacity group-hover:opacity-100"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-9 text-[11px] font-medium uppercase tracking-[0.18em] text-[#6e6c64] lg:flex">
          <Link href="/#projects" className="transition-colors hover:text-[#1c1b18]">
            {lang === "UA" ? "Проєкти" : "Projects"}
          </Link>
          <Link href="/#services" className="transition-colors hover:text-[#1c1b18]">
            {lang === "UA" ? "Послуги & Процес" : "Services & Process"}
          </Link>
          <Link href="/#calculator" className="transition-colors hover:text-[#1c1b18]">
            {lang === "UA" ? "Калькулятор" : "Calculator"}
          </Link>
          <Link href="/#about" className="transition-colors hover:text-[#1c1b18]">
            {lang === "UA" ? "Про студію" : "About"}
          </Link>
          <Link href="/#contact" className="transition-colors hover:text-[#1c1b18]">
            {lang === "UA" ? "Контакти" : "Contact"}
          </Link>
        </nav>

        {/* Controls: Currency, Language & Auth */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Currency Switcher */}
          <div className="flex items-center rounded-sm border border-[#e4e0d5] bg-[#f4f0e8] p-0.5 text-[11px] font-mono">
            {(["UAH", "USD", "EUR"] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`cursor-pointer px-2 py-1 transition-all ${
                  currency === curr
                    ? "bg-[#1c1b18] font-medium text-white shadow-xs"
                    : "text-[#6e6c64] hover:text-[#1c1b18]"
                }`}
              >
                {curr === "UAH" ? "₴" : curr === "USD" ? "$" : "€"}
              </button>
            ))}
          </div>

          {/* Language Switcher */}
          <div className="flex items-center rounded-sm border border-[#e4e0d5] bg-[#f4f0e8] p-0.5 text-[11px] font-mono">
            <button
              onClick={() => setLang("UA")}
              className={`cursor-pointer px-2.5 py-1 transition-all ${
                lang === "UA"
                  ? "bg-[#1c1b18] font-medium text-white shadow-xs"
                  : "text-[#6e6c64] hover:text-[#1c1b18]"
              }`}
            >
              UA
            </button>
            <button
              onClick={() => setLang("EN")}
              className={`cursor-pointer px-2.5 py-1 transition-all ${
                lang === "EN"
                  ? "bg-[#1c1b18] font-medium text-white shadow-xs"
                  : "text-[#6e6c64] hover:text-[#1c1b18]"
              }`}
            >
              EN
            </button>
          </div>

          <div className="hidden h-5 w-px bg-[#e4e0d5] sm:block"></div>

          {/* Dynamic Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.14em]">
            {user ? (
              isInDashboard ? (
                <button
                  onClick={handleLogout}
                  className="cursor-pointer border border-[#e4e0d5] bg-white px-4 py-2 text-[#1c1b18] transition-colors hover:border-[#1c1b18] hover:bg-[#1c1b18] hover:text-white"
                >
                  {lang === "UA" ? "Вихід" : "Logout"}
                </button>
              ) : (
                <Link
                  href={dashboardUrl}
                  className="cursor-pointer border border-[#1c1b18] bg-[#1c1b18] px-4.5 py-2 text-white transition-colors hover:bg-[#33312c]"
                >
                  {lang === "UA" ? "Кабінет" : "Dashboard"}
                </Link>
              )
            ) : (
              <Link
                href="/login"
                className="cursor-pointer border border-[#1c1b18] bg-[#1c1b18] px-4.5 py-2 text-white transition-colors hover:bg-[#33312c]"
              >
                {lang === "UA" ? "Увійти" : "Sign In"}
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
            className="flex size-9 items-center justify-center border border-[#e4e0d5] bg-[#f4f0e8] text-[#1c1b18] lg:hidden cursor-pointer"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-[#e4e0d5] bg-[#faf8f5] px-6 py-6 lg:hidden">
          <nav className="flex flex-col gap-4 text-xs font-medium uppercase tracking-[0.18em] text-[#6e6c64]">
            <Link
              href="/#projects"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#1c1b18]"
            >
              {lang === "UA" ? "Проєкти" : "Projects"}
            </Link>
            <Link
              href="/#services"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#1c1b18]"
            >
              {lang === "UA" ? "Послуги & Процес" : "Services & Process"}
            </Link>
            <Link
              href="/#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#1c1b18]"
            >
              {lang === "UA" ? "Калькулятор" : "Calculator"}
            </Link>
            <Link
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#1c1b18]"
            >
              {lang === "UA" ? "Про студію" : "About"}
            </Link>
            <Link
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#1c1b18]"
            >
              {lang === "UA" ? "Контакти" : "Contact"}
            </Link>

            <div className="pt-3 border-t border-[#e4e0d5]">
              {user ? (
                isInDashboard ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-center border border-[#e4e0d5] py-2.5 text-[#1c1b18]"
                  >
                    {lang === "UA" ? "Вихід" : "Logout"}
                  </button>
                ) : (
                  <Link
                    href={dashboardUrl}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center bg-[#1c1b18] py-2.5 text-white"
                  >
                    {lang === "UA" ? "Кабінет" : "Dashboard"}
                  </Link>
                )
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center bg-[#1c1b18] py-2.5 text-white"
                >
                  {lang === "UA" ? "Увійти в кабінет" : "Sign In"}
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}