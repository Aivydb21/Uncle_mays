import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { BrokenEcosystem } from "@/components/BrokenEcosystem";
import { PlatformExplanation } from "@/components/PlatformExplanation";
import { Mission } from "@/components/Mission";
import { HowItWorks } from "@/components/HowItWorks";
import { VendorNetwork } from "@/components/VendorNetwork";
import { Awards } from "@/components/Awards";
import { Pricing } from "@/components/Pricing";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <BrokenEcosystem />
      <PlatformExplanation />
      <HowItWorks />
      <Mission />
      <VendorNetwork />
      <Awards />
      <Pricing />
    </Layout>
  );
};

export default Index;
