"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const STORAGE_KEY = "um_accredited_confirmed";

const AccreditedGate = ({ onConfirm }: { onConfirm: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-background text-foreground rounded-2xl shadow-2xl max-w-lg w-full p-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Accredited Investor Confirmation</h2>
        <p className="text-sm text-foreground/70 mb-6 leading-relaxed">
          This page contains information about a private securities offering. Access is restricted to accredited investors as defined under SEC Rule 501(a). Nothing on this page constitutes a public offering or solicitation.
        </p>
        <div className="bg-muted rounded-xl p-4 mb-6 text-sm leading-relaxed">
          <strong>By continuing, you confirm:</strong>
          <p className="mt-2">
            &ldquo;I confirm that I am an accredited investor as defined under SEC Rule 501(a). This page contains information about a private securities offering. Nothing on this page constitutes a public offering or solicitation.&rdquo;
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full inline-flex items-center justify-center rounded-xl text-base font-semibold h-12 px-8 py-3 transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium"
          >
            I Confirm I Am an Accredited Investor
          </button>
          <a
            href="/"
            className="w-full inline-flex items-center justify-center rounded-xl text-base font-semibold h-12 px-8 py-3 transition-all duration-300 border border-border bg-background hover:bg-muted text-center"
          >
            I Am Not an Accredited Investor
          </a>
        </div>
      </div>
    </div>
  );
};

const Investors = () => {
  const [confirmed, setConfirmed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setConfirmed(true);
    }
    setChecked(true);
  }, []);

  const handleConfirm = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setConfirmed(true);
  };

  if (!checked) {
    // Avoid flash — render nothing until we've read sessionStorage
    return null;
  }

  return (
    <div className="min-h-screen">
      {!confirmed && <AccreditedGate onConfirm={handleConfirm} />}

      {/* Disclaimer banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 text-center text-sm text-amber-800">
        This page is intended for accredited investors only. The information herein relates to a private securities offering exempt from registration under the Securities Act of 1933. This is not a public offering.
      </div>

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
              href="mailto:anthony@unclemays.com"
              className="inline-flex items-center justify-center rounded-xl text-base font-semibold h-12 px-8 py-3 transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium"
            >
              Request the Pitch Book
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Investors;
