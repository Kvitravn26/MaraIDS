"use client";

import React, { createContext, useContext, useState } from "react";

export type Language = "UA" | "EN";
export type Currency = "UAH" | "USD" | "EUR";

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("UA");
  const [currency, setCurrency] = useState<Currency>("UAH");

  return (
    <AppContext.Provider value={{ lang, setLang, currency, setCurrency }}>
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