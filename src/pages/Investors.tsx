import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";

const Investors = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        <section className="relative py-24 bg-primary text-primary-foreground">
          <div className="container px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                The first data and distribution system for Black food.
              </h1>
              <p className="text-xl text-primary-foreground/80 leading-relaxed">
                Uncle May's is building a retail-first infrastructure platform for Black
                food consumption - turning real demand into smarter sourcing and distribution
                decisions over time.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-background">
          <div className="container px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                A $100B+ underserved market with no system of record.
              </h2>
              <p className="text-lg text-foreground/80 leading-relaxed mb-10">
                If you would like our pitch materials, request the pitch book and we will
                follow up with next steps.
              </p>

              <a
                href="mailto:anthony@unclemays.com?subject=Request%20Pitch%20Book%20-%20Uncle%20May%27s%20Produce"
                className="inline-flex items-center justify-center rounded-xl text-base font-semibold h-12 px-8 py-3 transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium"
              >
                Request the Pitch Book
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Investors;

