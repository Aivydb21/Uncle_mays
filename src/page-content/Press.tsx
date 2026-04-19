"use client";

import { motion } from "framer-motion";
import { Mail, Phone, Download, Award, Mic, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const awards = [
  {
    year: "2025",
    title: "Chicago TechRise Award",
    org: "P33 Chicago",
    description: "Chicago's premier technology and innovation pitch competition, recognizing Uncle May's data platform approach to neighborhood grocery retail.",
  },
  {
    year: "2025",
    title: "World Business Chicago Food Innovation Award",
    org: "World Business Chicago",
    description: "Awarded by Chicago's public-private economic development organization for innovation in the food sector.",
  },
  {
    year: "2026",
    title: "SXSW Speaker",
    org: "Midwest House at SXSW Austin",
    description: "Anthony Ivy spoke on \"The Business of Belonging: From Pop-Up to Powerhouse\" at the World Business Chicago and Obama Foundation-partnered Midwest House programming.",
  },
];

const keyFacts = [
  { label: "Founded", value: "2024" },
  { label: "Flagship Location", value: "Hyde Park, Chicago (10,000 sq ft)" },
  { label: "Year 1 Revenue Projection", value: "$6.3M ($629/sq ft)" },
  { label: "Gross Margin (stabilized)", value: "35%" },
  { label: "EBITDA Margin", value: "15.3%" },
  { label: "10-Year Vision", value: "82 stores, $625M revenue" },
  { label: "TAM", value: "$100B+ annual Black grocery spend" },
  { label: "SBA Financing", value: "$2M (Busey Bank, conditionally approved)" },
];

const storyAngles = [
  {
    audience: "Business Press",
    outlets: "Crain's Chicago Business, Chicago Tribune",
    angles: [
      "Chicago entrepreneur secures $2M SBA loan for Hyde Park flagship grocery",
      "Booth MBA brings PE/M&A rigor to neighborhood retail",
      "Award-winning model rewires the supply and demand story for Black food",
    ],
  },
  {
    audience: "Black Business Press",
    outlets: "Black Enterprise, Essence, The Root, Capital B",
    angles: [
      "First data and distribution platform built specifically for Black food consumption",
      "SXSW speaker launches 10,000 sq ft flagship after proving demand with produce boxes",
      "From PE to produce: how a Booth MBA is building a $625M grocery vision",
    ],
  },
  {
    audience: "Food and Retail Trade",
    outlets: "Grocery Dive, Progressive Grocer, Civil Eats",
    angles: [
      "Distribution-first approach: connecting Black farmers to Black households before the doors open",
      "35% gross margins in neighborhood format: a replicable unit economics model",
      "TechRise Award winner reimagines grocery for underserved yet affluent communities",
    ],
  },
];

const Press = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 md:py-24 border-b border-border/40">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto"
          >
            <p className="text-sm font-semibold tracking-wide text-primary uppercase mb-4">Press Room</p>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Uncle May&apos;s Produce in the Media
            </h1>
            <p className="text-lg text-foreground/80 leading-relaxed max-w-2xl">
              We&apos;re building the first data and distribution platform for Black food consumption, starting with
              produce boxes and a 10,000 sq ft flagship in Chicago&apos;s Hyde Park. Resources for journalists and media
              professionals are below.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-16 md:py-20">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <Award className="h-6 w-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold">Awards &amp; Recognition</h2>
              </div>
              <div className="space-y-4">
                {awards.map((award, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="bg-card rounded-xl p-6 border border-border/50 shadow-soft"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full shrink-0 self-start">
                        {award.year}
                      </span>
                      <div>
                        <h3 className="font-bold text-lg mb-1">{award.title}</h3>
                        <p className="text-sm text-primary font-semibold mb-2">{award.org}</p>
                        <p className="text-foreground/70 text-sm leading-relaxed">{award.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Company Boilerplate / Key Facts */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold">Company Overview</h2>
              </div>
              <p className="text-foreground/70 mb-8 leading-relaxed">
                Uncle May&apos;s Produce is the first data and distribution platform for Black food consumption.
                The company operates neighborhood-format grocery stores (7,500 to 12,000 sq ft) targeting
                historically Black American and culturally thriving urban communities. The produce box delivery
                business validates demand and builds the customer data flywheel before the flagship store opens.
                Founded by Anthony Ivy (Chicago Booth MBA, PE and M&amp;A background), the company has secured
                a $2M SBA 7(a) loan, signed a letter of intent on the Hyde Park location, and assembled a
                leadership team with decades of experience across Amazon, BofA, Unilever, and P&amp;G.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {keyFacts.map((fact, i) => (
                  <div key={i} className="bg-card rounded-lg p-4 border border-border/50">
                    <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wide mb-1">{fact.label}</p>
                    <p className="font-semibold text-foreground">{fact.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story Angles */}
      <section className="py-16 md:py-20">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <Mic className="h-6 w-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold">Story Angles</h2>
              </div>
              <div className="space-y-6">
                {storyAngles.map((section, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="bg-card rounded-xl p-6 border border-border/50 shadow-soft"
                  >
                    <h3 className="font-bold text-lg mb-1">{section.audience}</h3>
                    <p className="text-sm text-primary font-semibold mb-3">{section.outlets}</p>
                    <ul className="space-y-2">
                      {section.angles.map((angle, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-foreground/75">
                          <span className="text-primary font-bold mt-0.5 shrink-0">—</span>
                          {angle}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Press Contact */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid md:grid-cols-2 gap-10"
            >
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Press Contact</h2>
                <p className="text-foreground/70 mb-6 leading-relaxed">
                  We&apos;re available for interviews, speaking engagements, expert commentary on Black food
                  systems, SBA financing for grocery, and neighborhood retail innovation. High-res photos and
                  additional materials are available on request.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary shrink-0" />
                    <a href="mailto:press@unclemays.com" className="font-semibold hover:text-primary transition-colors">
                      press@unclemays.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary shrink-0" />
                    <a href="tel:+13129722595" className="font-semibold hover:text-primary transition-colors">
                      (312) 972-2595
                    </a>
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-sm font-semibold text-foreground/60 uppercase tracking-wide mb-2">
                    Anthony Ivy, Founder &amp; CEO
                  </p>
                  <ul className="text-sm text-foreground/70 space-y-1">
                    <li>2025 Chicago TechRise Award Winner</li>
                    <li>2025 World Business Chicago Food Innovation Award Winner</li>
                    <li>SXSW 2026 Speaker</li>
                    <li>Chicago Booth MBA</li>
                    <li>PE/M&amp;A Background</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg">Media Assets</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  The following materials are available for editorial use:
                </p>
                <ul className="space-y-2 text-sm text-foreground/70">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold shrink-0">—</span>
                    Company logo (high-res PNG and SVG)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold shrink-0">—</span>
                    Founder headshot
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold shrink-0">—</span>
                    Product photography (produce boxes)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold shrink-0">—</span>
                    Store renderings (Hyde Park flagship)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold shrink-0">—</span>
                    Company boilerplate and bio
                  </li>
                </ul>
                <div className="pt-2">
                  <Button asChild variant="outline" className="gap-2">
                    <a href="mailto:press@unclemays.com?subject=Media%20Kit%20Request">
                      <Download className="h-4 w-4" />
                      Request Media Kit
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Available For */}
      <section className="py-16 md:py-20">
        <div className="container px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Available For</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "Interviews (phone, video, in-person)",
                  "Speaking engagements and panels",
                  "Podcast appearances",
                  "Produce box demos",
                  "Store tours (upon flagship opening)",
                  "Thought leadership articles",
                  "Expert commentary on Black food systems",
                  "SBA financing for grocery (replicable model)",
                  "Neighborhood retail innovation",
                ].map((item, i) => (
                  <div key={i} className="bg-card rounded-lg p-4 border border-border/50 text-sm text-foreground/80">
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Press;
