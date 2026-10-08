import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Services from "@/components/Services";
import Calculator from "@/components/Calculator";
import Workflow from "@/components/Workflow";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white">
      <Hero />
      <Projects />
      <Services />
      <Calculator />
      <Workflow />
    </main>
  );
}