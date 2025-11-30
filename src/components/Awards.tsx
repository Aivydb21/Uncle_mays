import { motion } from "framer-motion";
import { Award, Trophy } from "lucide-react";

const awards = [
  {
    icon: Trophy,
    organization: "World Business Chicago / TechRise",
    title: "Food Innovation Award",
  },
  {
    icon: Award,
    organization: "Naturally Chicago",
    title: "Top 5 Chicago Food Startups",
  },
];

export const Awards = () => {
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Award-Winning Excellence</h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Recognized for our commitment to quality, innovation, and community impact.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {awards.map((award, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="bg-primary-foreground/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <award.icon className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{award.organization}</h3>
              <p className="text-primary-foreground/70">{award.title}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
