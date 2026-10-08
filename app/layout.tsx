import "./globals.css";
import Header from "@/components/Header";
import { AppProvider } from "@/context/AppContext";

export const metadata = {
  title: "MARA DESIGN STUDIO",
  description: "3D Interior & Architecture Visualization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" className="dark">
      <body className="bg-[#0a0a0b] text-zinc-100 antialiased min-h-screen">
        <AppProvider>
          <Header />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}