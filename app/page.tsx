import Hero from "@/components/Hero";
import Projects from "@/components/Projects";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white">
      <Hero />
      <Projects />
    </main>
  );
}