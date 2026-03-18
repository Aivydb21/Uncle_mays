import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Mission } from "@/components/Mission";
import { Awards } from "@/components/Awards";
import { Users, Heart, Leaf } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Leaf,
      title: "Support Black Farmers",
      description: "We partner with Black farmers - and turn retail demand into better purchasing signals that strengthen the network.",
    },
    {
      icon: Heart,
      title: "Community First",
      description: "Retail touchpoints create trusted access today - and compounding advantage over time through proprietary food demand data.",
    },
    {
      icon: Users,
      title: "Heritage, at scale",
      description: "We build a system designed for Black food at scale - rooted in the people who grew it, powered by proprietary food data.",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative py-24 bg-primary text-primary-foreground">
          <div className="container px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                Retail today. Infrastructure for Black food consumption.
              </h1>
              <p className="text-xl text-primary-foreground/80">
                Uncle May's is building the first data and distribution system for Black food consumption in the U.S. - where retail demand becomes a compounding data moat and smarter distribution over time.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <Mission />

        {/* Values Section */}
        <section className="py-24 bg-background">
          <div className="container px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Values</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="bg-card rounded-2xl p-8 shadow-soft"
                >
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-foreground/70 leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Awards Section */}
        <Awards />
      </div>
    </Layout>
  );
};

export default About;

