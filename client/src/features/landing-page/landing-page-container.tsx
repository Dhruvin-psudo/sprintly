import { Hero } from "./components/hero";
import { ProductMockup } from "./components/product-mockup";
import { Features } from "./components/features";
import { Benefits } from "./components/benefits";
import { HowItWorks } from "./components/how-it-works";
import { Testimonials } from "./components/testimonials";
import { FinalCTA } from "./components/final-cta";
import { Stats } from "./components/stats";

export function LandingPageContainer() {
  return (
    <>
      <Hero />
      <Stats />
      <ProductMockup />
      <Features />
      <Benefits />
      <HowItWorks />
      <Testimonials />
      <FinalCTA />
    </>
  );
}
