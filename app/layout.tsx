import { Suspense } from "react";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { AppProvider } from "@/context/AppContext";

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin", "cyrillic-ext"],
  variable: "--font-serif",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: "Mara Design STUDIO — 3D Architecture & Interior Visualization",
  description:
    "Photorealistic 3D visualization and space design studio inspired by architectural restraint and warm livability.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" className={`${cormorant.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-[#faf8f5] text-[#1c1b18] font-sans antialiased selection:bg-[#e4decb] selection:text-[#1c1b18]">
        <AppProvider>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}