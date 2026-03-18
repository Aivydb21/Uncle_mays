import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { Mission } from "@/components/Mission";
import { VendorNetwork } from "@/components/VendorNetwork";
import { Pricing } from "@/components/Pricing";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Mission />
      <VendorNetwork />
      <Pricing />
    </Layout>
  );
};

export default Index;
