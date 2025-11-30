import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { Mission } from "@/components/Mission";
import { HowItWorks } from "@/components/HowItWorks";
import { Awards } from "@/components/Awards";
import { Pricing } from "@/components/Pricing";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Mission />
      <HowItWorks />
      <Awards />
      <Pricing />
    </Layout>
  );
};

export default Index;
