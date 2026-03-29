import { Link } from "react-router-dom";
import { Mail, MapPin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

const WAITLIST_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfmaSTz-8JuH3RXsL3sCBakVjBcqGQML6muiYeFOdLQ-FwqoA/viewform?usp=sharing&ouid=110071880161586206166";

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
              Fresh produce from Black farmers, dropped in Chicago neighborhoods. Join the waitlist — it's free.
            </p>
            {/* Footer CTA */}
            <div className="flex flex-col gap-2 max-w-xs">
              <Button
                asChild
                className="bg-background text-foreground hover:bg-background/90 font-semibold"
              >
                <a href={WAITLIST_FORM_URL} target="_blank" rel="noopener noreferrer">
                  Join the Waitlist — Free
                </a>
              </Button>
              <p className="text-xs text-background/50">
                Join 500+ Chicagoans already on the list.
              </p>
            </div>
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
                  href={WAITLIST_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Join the Waitlist
                </a>
              </li>
              <li>
                <a
                  href="mailto:anthony@unclemays.com"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Request Pitch Book
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
                  className="text-background/70 hover:text-background transition-colors"
                >
                  info@unclemays.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Instagram className="h-5 w-5 text-background/70 flex-shrink-0 mt-0.5" />
                <a
                  href="https://instagram.com/unclemays"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  @unclemays
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/60 text-sm">
              © 2026 Uncle Mays Produce. All rights reserved.
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
