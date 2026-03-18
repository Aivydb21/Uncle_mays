import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";

const FAQ = () => {
  const faqs = [
    {
      question: "How does Uncle May's work?",
      answer:
        "Uncle May's is building a retail-first infrastructure platform for Black food consumption. Retail touchpoints create proprietary demand signals that power sourcing, pricing intelligence, and distribution decisions over time.",
    },
    {
      question: "Who do you partner with?",
      answer:
        "We partner with Black farmers, Black food brands, and distribution partners to unify fragmented supply and demand through a single system.",
    },
    {
      question: "What is the platform model?",
      answer:
        "Retail is the acquisition engine for data, demand, and supply. That creates a compounding data moat that powers smarter matching between consumer demand and the vendor network.",
    },
    {
      question: "Is this an AI startup?",
      answer:
        "We are building an AI-driven operating system to convert demand signals into decisions. Retail is real today; the platform layer compounds advantage over time.",
    },
    {
      question: "How do I get access?",
      answer:
        "Join the waitlist for investors, or partner with us as a vendor/farmer. We will share next steps as the platform expands.",
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
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-primary-foreground/80">
                Everything you need to know about Uncle Mays Produce.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-background">
          <div className="container px-6">
            <div className="max-w-4xl mx-auto">
              <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/50 bg-card">
                {faqs.map((faq, index) => (
                  <div key={index} className="p-6 md:p-8">
                    <h3 className="text-2xl font-semibold mb-3">{faq.question}</h3>
                    <p className="text-foreground/70 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default FAQ;

