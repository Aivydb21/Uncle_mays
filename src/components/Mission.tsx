import { motion } from "framer-motion";
// TODO: Replace with farmer.jpg when you have the image
// For now, using heritage.jpg as placeholder - add your farmer image to src/assets/farmer.jpg
import heritageImage from "@/assets/heritage.jpg";
const farmerImage = heritageImage; // Temporary - replace with farmer.jpg import when ready

export const Mission = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Rooted in community. Built for a <span className="text-primary">compounding data moat</span>.
            </h2>
            <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
              Uncle May's Produce exists to strengthen Black food consumption - connecting families
              to Black farmers and brands through retail that people can trust.
            </p>
            <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
              Retail stores + vendor network create the rare combination competitors can't
              replicate: the consumer interface and the supplier network at scale. Retail is the
              acquisition engine for data, demand, and supply. We unify fragmented supply and
              demand through a single system.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-foreground/70">The first scalable consumer interface for Black food demand.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-foreground/70">Compounding data moat.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-foreground/70">No competitor owns both the consumer interface and supplier network at scale.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-foreground/70">This dataset cannot be replicated without owning both the consumer interface and the supplier network.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-medium">
              <img
                src={farmerImage}
                alt="Black farmer representing agricultural heritage and excellence"
                className="w-full h-[500px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-secondary text-white p-6 rounded-xl shadow-medium">
              <p className="text-3xl font-bold">100+</p>
              <p className="text-sm">Black Farmer Partners</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
