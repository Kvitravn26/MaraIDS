import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Calculator from "@/components/Calculator";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white">
      <Hero />
      <Projects />
      <Calculator />
    </main>
  );
}