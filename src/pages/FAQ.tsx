import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "How does the subscription work?",
      answer: "Choose from our Starter, Family, or Community box plans. You'll receive fresh produce from Black farmers on a schedule that works for you - weekly or bi-weekly. You can pause, skip, or cancel anytime.",
    },
    {
      question: "Where do you source your produce?",
      answer: "We partner with over 100 Black farmers across the United States. Each box contains seasonal produce harvested at peak ripeness, ensuring the freshest quality while supporting Black agricultural heritage.",
    },
    {
      question: "What's included in each box?",
      answer: "Box contents vary by season and plan. Starter boxes include 5-7 items, Family boxes have 12-15 items, and Community boxes contain 20-25 items. All boxes include recipe cards and information about the farmers who grew your produce.",
    },
    {
      question: "Can I customize my box?",
      answer: "Yes! Community box subscribers can customize their boxes. Starter and Family boxes are curated for variety, but you can note preferences and we'll do our best to accommodate.",
    },
    {
      question: "What areas do you deliver to?",
      answer: "We currently deliver to the Chicago metropolitan area. We're expanding to more cities soon! Sign up for our newsletter to be notified when we launch in your area.",
    },
    {
      question: "How do I pause or cancel my subscription?",
      answer: "You can manage your subscription anytime through your account dashboard. Pause for a week, skip deliveries, or cancel - all with no penalties or fees.",
    },
    {
      question: "Are your products organic?",
      answer: "Many of our partner farmers use organic and sustainable farming practices. Each box includes information about the farming methods used. We prioritize supporting Black farmers regardless of certification status.",
    },
    {
      question: "What if I'm not satisfied with my box?",
      answer: "We stand behind the quality of our produce. If you're not satisfied, contact us within 48 hours of delivery and we'll make it right with a replacement or refund.",
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
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-foreground/70 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default FAQ;

