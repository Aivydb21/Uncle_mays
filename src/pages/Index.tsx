import { Layout } from "@/components/Layout";
import { Hero } from "@/components/Hero";
import { VendorNetwork } from "@/components/VendorNetwork";
import { Pricing } from "@/components/Pricing";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <VendorNetwork />
      <Pricing />
    </Layout>
  );
};

export default Index;
