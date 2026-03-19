import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold text-background">
                Uncle May's Produce
              </span>
            </div>
            <p className="text-background/70 mb-6 max-w-md leading-relaxed">
              Retail that people trust - built to power a proprietary data and distribution system for Black food consumption.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#boxes"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Shop Produce Boxes
                </a>
              </li>
              <li>
                <a
                  href="mailto:anthony@unclemays.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Request Pitch Book
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@unclemays.com?subject=Partner%20With%20Us%20-%20Uncle%20May%27s%20Produce"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Partner With Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-background/70 flex-shrink-0 mt-0.5" />
                <span className="text-background/70">73 W Monroe Ave #3002, Chicago, IL 60603</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-background/70 flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:info@unclemays.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  info@unclemays.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">
              © 2025 Uncle Mays Produce. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-background/60 hover:text-background text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-background/60 hover:text-background text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
