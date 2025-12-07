import { HeroSection } from "@/components/home/hero";
import { StatsSection } from "@/components/home/statsSection";
import { ServicesPreview } from "@/components/home/servicesPreview";
import { CtaSection } from "@/components/home/ctaSection";

export default function Home() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen">
      <HeroSection />
      <ServicesPreview />
      <StatsSection />
      <CtaSection />
    </div>
  );
}
