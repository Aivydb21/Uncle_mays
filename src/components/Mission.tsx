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
              Platform first. First store opens soon.
            </h2>
            <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
              We are building the infrastructure platform for Black food consumption.
              The first store opens soon to create demand signals that improve sourcing,
              pricing, and distribution over time.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-foreground/70">Retail connects people to Black food brands.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-foreground/70">Demand signals power a proprietary system.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p className="text-foreground/70">Vendors and distribution scale with real demand.</p>
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
          </motion.div>
        </div>
      </div>
    </section>
  );
};
