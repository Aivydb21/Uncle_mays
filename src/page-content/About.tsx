"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 md:py-24">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto"
          >
            <p className="text-sm font-semibold tracking-wide text-primary uppercase mb-4">About Uncle May</p>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              The story behind Uncle May&apos;s Produce
            </h1>
            <p className="text-lg text-foreground/80 leading-relaxed">
              We started this company to make fresh food easier to access in Chicago while making sure more dollars
              flow directly to Black farmers.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20 md:pb-24">
        <div className="container px-6">
          <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto items-start">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="rounded-2xl overflow-hidden shadow-medium border border-border/50"
            >
              <img
                src="/images/heritage.jpg"
                alt="Founder portrait representing Uncle May's Produce roots in Chicago community"
                className="w-full h-full object-cover"
                width={1200}
                height={900}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-soft border border-border/50"
            >
              <h2 className="text-2xl font-bold mb-4">Founder story</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Uncle May was the person in our family who taught us that food is care. He knew every neighbor by
                name, shared what he had, and believed a good meal could pull a whole block together. That spirit is
                the foundation of this business.
              </p>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Uncle May&apos;s Produce began with a simple question. Why is it still hard for many Chicago families to
                get truly fresh produce while Black farmers are still fighting for consistent market access? We built a
                direct path between both sides. Families get seasonal produce boxes delivered every Wednesday. Farmers get
                fairer demand and more predictable income.
              </p>
              <p className="text-foreground/80 leading-relaxed mb-4">
                We are not trying to be the biggest food company. We are building the most trusted local one.
                Everything we do comes back to freshness, dignity, and community ownership. Every order is one-time.
                No subscription, no commitment, just a better way to buy food that keeps value in the communities that
                grow it and the neighborhoods that eat it.
              </p>
              <p className="font-semibold text-foreground">
                Mission: Fresh produce from Black farmers to Chicago.
              </p>

              <div className="mt-8">
                <Button asChild size="lg" className="font-semibold">
                  <a href="/#boxes">Shop Produce Boxes</a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
