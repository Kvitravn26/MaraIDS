import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Services from "@/components/Services";
import About from "@/components/About";
import Calculator from "@/components/Calculator";
import Workflow from "@/components/Workflow";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white">
      <Hero />
      <Projects />
      <Services />
      <About />
      <Calculator />
      <Workflow />
      <Contact />
      <Footer />
    </main>
  );
}