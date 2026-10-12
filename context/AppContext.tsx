"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "UA" | "EN";
export type Currency = "UAH" | "USD" | "EUR";

export const CURRENCY_RATES: Record<Currency, { symbol: string; rate: number; label: string }> = {
  UAH: { symbol: "₴", rate: 1, label: "UAH" },
  USD: { symbol: "$", rate: 0.024, label: "USD" },
  EUR: { symbol: "€", rate: 0.022, label: "EUR" },
};

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceUah: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("UA");
  const [currency, setCurrencyState] = useState<Currency>("UAH");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedLang = window.localStorage.getItem("mara-language");
      if (savedLang === "EN" || savedLang === "UA") {
        setLangState(savedLang);
        document.documentElement.lang = savedLang === "UA" ? "uk" : "en";
      }

      const savedCurrency = window.localStorage.getItem("mara-currency");
      if (savedCurrency === "USD" || savedCurrency === "EUR" || savedCurrency === "UAH") {
        setCurrencyState(savedCurrency);
      }
    } catch {
      // Ignore localStorage errors
    }
    setMounted(true);
  }, []);

  const setLang = (nextLang: Language) => {
    setLangState(nextLang);
    try {
      window.localStorage.setItem("mara-language", nextLang);
      document.documentElement.lang = nextLang === "UA" ? "uk" : "en";
    } catch {}
  };

  const setCurrency = (nextCurrency: Currency) => {
    setCurrencyState(nextCurrency);
    try {
      window.localStorage.setItem("mara-currency", nextCurrency);
    } catch {}
  };

  const formatPrice = (priceUah: number) => {
    const cur = CURRENCY_RATES[currency];
    const converted = Math.round(priceUah * cur.rate);
    const locale = lang === "UA" ? "uk-UA" : "en-US";
    return `${converted.toLocaleString(locale)} ${cur.symbol}`;
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        currency,
        setCurrency,
        formatPrice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}