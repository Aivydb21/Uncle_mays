import Link from "next/link";
import { Mail, MapPin, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

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
              Fresh produce from Black farmers, delivered across Chicago. No subscription required. Just good food.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  About Uncle May
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <a
                  href="/#boxes"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Shop Produce Boxes
                </a>
              </li>
              <li>
                <Link
                  href="/manage-subscription"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Manage Subscription
                </Link>
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
                  href="https://www.instagram.com/unclemaysproduce/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  @unclemaysproduce
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
              <Link href="/privacy" className="text-background/60 hover:text-background text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-background/60 hover:text-background text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
