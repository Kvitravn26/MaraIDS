import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Services from "@/components/Services";
import About from "@/components/About"; // <-- Імпорт
import Calculator from "@/components/Calculator";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <main className="bg-[#0a0a0c] min-h-screen text-white">
      <Header />
      <Hero />
      <Projects />
      <Services />
      <About /> {/* <-- Рендеринг блоку */}
      <Calculator />
      <Contact />
    </main>
  );
}