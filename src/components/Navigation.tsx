import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/", label: "Pricing", hash: "#pricing" },
    { path: "/faq", label: "FAQ" },
    { path: "/investors", label: "Investors" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handlePricingClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname !== "/") {
      // If not on home page, navigate first then scroll
      e.preventDefault();
      window.location.href = "/#pricing";
    } else {
      // If on home page, just scroll
      e.preventDefault();
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <img 
            src="/uncle-mays-logo.png" 
            alt="Uncle Mays Produce Logo" 
            className="h-12 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => {
            if (link.hash) {
              return (
                <a
                  key={link.path + link.hash}
                  href={link.path + link.hash}
                  onClick={handlePricingClick}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === "/" ? "text-primary" : "text-foreground/60"
                  }`}
                >
                  {link.label}
                </a>
              );
            }
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path)
                    ? "text-primary"
                    : "text-foreground/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Button 
            size="sm"
            onClick={() => {
              if (location.pathname !== "/") {
                window.location.href = "/#pricing";
              } else {
                const pricingSection = document.getElementById('pricing');
                if (pricingSection) {
                  pricingSection.scrollIntoView({ behavior: 'smooth' });
                }
              }
            }}
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t bg-background"
          >
            <div className="container px-6 py-4 space-y-4">
              {navLinks.map((link) => {
                if (link.hash) {
                  return (
                    <a
                      key={link.path + link.hash}
                      href={link.path + link.hash}
                      onClick={(e) => {
                        setIsOpen(false);
                        handlePricingClick(e);
                      }}
                      className={`block text-base font-medium transition-colors hover:text-primary ${
                        location.pathname === "/" ? "text-primary" : "text-foreground/60"
                      }`}
                    >
                      {link.label}
                    </a>
                  );
                }
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block text-base font-medium transition-colors hover:text-primary ${
                      isActive(link.path)
                        ? "text-primary"
                        : "text-foreground/60"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Button 
                className="w-full mt-4"
                onClick={() => {
                  setIsOpen(false);
                  if (location.pathname !== "/") {
                    window.location.href = "/#pricing";
                  } else {
                    const pricingSection = document.getElementById('pricing');
                    if (pricingSection) {
                      pricingSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
              >
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

