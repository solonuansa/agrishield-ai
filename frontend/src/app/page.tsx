import dynamic from "next/dynamic";
import HeroSection from "@/components/sections/HeroSection";

const StatsSection = dynamic(() => import("@/components/sections/StatsSection"));
const FeaturesSection = dynamic(() => import("@/components/sections/FeaturesSection"));
const HowItWorksSection = dynamic(() => import("@/components/sections/HowItWorksSection"));
const SupportedPlantsSection = dynamic(() => import("@/components/sections/SupportedPlantsSection"));
const TestimonialsSection = dynamic(() => import("@/components/sections/TestimonialsSection"));
const CTASection = dynamic(() => import("@/components/sections/CTASection"));

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SupportedPlantsSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
