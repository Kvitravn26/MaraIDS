import { Suspense } from "react";
import "./globals.css";
import Header from "@/components/Header";
import { AppProvider } from "@/context/AppContext";

export const metadata = {
  title: "MARA DESIGN STUDIO — 3D Architecture & Interior Visualization",
  description: "Photorealistic 3D visualization and space design studio inspired by architectural restraint and warm livability.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
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