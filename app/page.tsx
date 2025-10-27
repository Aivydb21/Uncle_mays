'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Leaf, Star, CheckCircle, MapPin, Users } from "lucide-react"
import { BeautifulSubscribeForm } from "@/components/BeautifulSubscribeForm"


export default function ProduceBoxDemandTesting() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with Branding */}
      <header className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            {/* Logo/Brand Area */}
            <div className="flex items-center space-x-4">
              <img 
                src="/uncle-mays-logo.png" 
                alt="UNCLE MAY'S Produce & Provisions" 
                className="h-12 md:h-16 w-auto object-contain"
              />
              <div className="text-center md:text-left">
                <div className="text-2xl md:text-3xl font-bold text-amber-900 tracking-wider">
                  UNCLE MAY'S PRODUCE
                </div>
              </div>
            </div>
          </div>
          
          
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-amber-50 via-yellow-50 to-background py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-8 px-6 py-3 text-sm font-medium shadow-sm bg-amber-100 text-amber-800 border-amber-200">
            Black-Owned • Community-Focused • Farm-Fresh
          </Badge>
          
          {/* Main Headline */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-amber-900 mb-6 leading-tight">
              Black Farmers. Fresh Food. Your Door.
            </h1>
          </div>

          {/* Primary CTA - Moved Higher */}
          <div className="mb-8">
            <Button 
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 mb-4"
              onClick={() => {
                // Track hero CTA click
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'hero_cta_click', {
                    event_category: 'engagement',
                    event_label: 'Reserve Your Spot'
                  });
                }
                // Track Facebook event
                if (typeof window !== 'undefined' && (window as any).fbq) {
                  (window as any).fbq('track', 'Lead', {
                    content_name: 'Hero CTA Click',
                    content_category: 'Hero Section',
                    value: 1.00,
                    currency: 'USD'
                  });
                }
                // Scroll to signup form
                document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Reserve your spot for our first produce box or pop-up event →
            </Button>
            
            {/* Social Proof Line */}
            <p className="text-lg text-amber-700 font-medium">
              Join 500+ Chicagoans waiting for our first produce drop.
            </p>
          </div>

          {/* Supporting Text */}
          <div className="mb-16">
            <p className="text-xl md:text-2xl text-amber-800 mb-4 max-w-3xl mx-auto leading-relaxed font-medium">
              Be first to get Uncle May's Produce — curated boxes from Black farmers and limited pop-up market events across Chicago.
            </p>
            <p className="text-lg text-amber-700 mb-8 max-w-2xl mx-auto">
              We're launching soon. Tell us how you want in.
            </p>
            
            {/* Secondary CTA */}
            <div>
            <button 
              className="text-amber-600 hover:text-amber-800 text-sm font-medium underline transition-colors duration-200"
              onClick={() => {
                // Track Facebook event
                if (typeof window !== 'undefined' && (window as any).fbq) {
                  (window as any).fbq('track', 'ViewContent', {
                    content_name: 'How It Works Click',
                    content_category: 'Hero Section',
                    value: 1.00,
                    currency: 'USD'
                  });
                }
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              See how it works ↓
            </button>
            </div>
          </div>
        </div>
        
        {/* Hero Visual */}
        <div className="max-w-xl mx-auto mt-16">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="/hero-woman-selecting-produce.jpg" 
              alt="A young woman carefully selecting fresh produce at Uncle May's Produce" 
              className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-contain object-center"
              style={{ imageRendering: 'high-quality' as any }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* What We're Building Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-amber-50/30 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-amber-900">What we're building</h2>
            <p className="text-lg text-amber-700 max-w-3xl mx-auto leading-relaxed">
              Uncle May's Produce is a modern neighborhood grocery experience. We source from Black farmers and food makers and bring that food directly to you — through curated produce boxes and seasonal pop-up markets in your neighborhood.
            </p>
          </div>
          
          {/* Store Visual */}
          <div className="max-w-xl mx-auto mb-16">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="/store-interior.jpg" 
                alt="Interior of Uncle May's Produce store with fresh produce displays" 
                className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-contain object-center"
                style={{ imageRendering: 'high-quality' as any }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white border border-amber-200 rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-200">
                <Leaf className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900 mb-3">Fresh produce grown by Black farmers</h3>
              <p className="text-amber-700 text-sm leading-relaxed">Directly sourced from local Black growers, ensuring the freshest quality while supporting our community's agricultural heritage.</p>
            </div>

            <div className="bg-white border border-amber-200 rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-200">
                <Users className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900 mb-3">Prepared foods + culturally-rooted flavors</h3>
              <p className="text-amber-700 text-sm leading-relaxed">Authentic recipes and prepared foods that celebrate our cultural traditions and bring families together around the table.</p>
            </div>

            <div className="bg-white border border-amber-200 rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-200">
                <MapPin className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900 mb-3">Circulating dollars back into our community</h3>
              <p className="text-amber-700 text-sm leading-relaxed">Every purchase strengthens our local economy, creating jobs and opportunities that benefit our neighborhoods directly.</p>
            </div>
          </div>

          <div className="text-center">
            <button 
              className="text-amber-600 hover:text-amber-800 font-medium underline transition-colors duration-200"
              onClick={() => {
                // Track Facebook event
                if (typeof window !== 'undefined' && (window as any).fbq) {
                  (window as any).fbq('track', 'Lead', {
                    content_name: 'Get Early Access Click',
                    content_category: 'What We\'re Building',
                    value: 1.00,
                    currency: 'USD'
                  });
                }
                document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Get Early Access →
            </button>
          </div>
        </div>
      </section>

      {/* Why This Matters Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-amber-900">Why this matters</h2>
            <p className="text-lg text-amber-700 max-w-3xl mx-auto leading-relaxed">
              Big grocery chains are not serving our neighborhoods with the quality, dignity, and ownership we deserve. Uncle May's is changing that by building a grocery model that keeps value in the community — from soil to shelf.
            </p>
          </div>
          
          {/* Heritage Visual */}
          <div className="max-w-lg mx-auto mb-16">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="/gardener-heritage.jpg" 
                alt="An older Black man tending to his garden, representing the heritage and community connection of Uncle May's Produce" 
                className="w-full h-48 sm:h-56 md:h-64 object-contain object-center"
                style={{ imageRendering: 'high-quality' as any }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
          

          <div className="text-center mb-12">
            <blockquote className="text-xl text-amber-800 italic max-w-3xl mx-auto leading-relaxed">
              "We're not asking for permission from grocery chains. We're building our own supply chain."
            </blockquote>
            <cite className="text-amber-600 font-medium mt-4 block">– Anthony Ivy, Founder & CEO</cite>
          </div>

          <div className="text-center">
            <Button 
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => {
                // Track Facebook event
                if (typeof window !== 'undefined' && (window as any).fbq) {
                  (window as any).fbq('track', 'Lead', {
                    content_name: 'Notify Me When You Launch Click',
                    content_category: 'Why This Matters',
                    value: 1.00,
                    currency: 'USD'
                  });
                }
                document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Notify Me When You Launch →
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works - Two Offers */}
      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-b from-amber-50/50 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-amber-900">How it works</h2>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto">
              Choose how you want to experience Uncle May's. We're building both options based on your demand.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Produce Box Card */}
            <Card className="border-2 border-amber-200 shadow-xl bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-amber-900">The Uncle May's Produce Box</CardTitle>
                <CardDescription className="text-base text-amber-700 leading-relaxed">
                  A rotating box of fresh produce and goods from Black farmers and food makers. Limited drops. Pick up or local delivery.
                </CardDescription>
                <div className="mt-4">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    First drop is invite-only
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <button 
                  className="text-amber-600 hover:text-amber-800 font-medium underline transition-colors duration-200"
                  onClick={() => {
                    // Track Facebook event
                    if (typeof window !== 'undefined' && (window as any).fbq) {
                      (window as any).fbq('track', 'ViewContent', {
                        content_name: 'Produce Box Interest',
                        content_category: 'How It Works',
                        value: 25.00,
                        currency: 'USD'
                      });
                    }
                    document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  I want a box →
                </button>
              </CardContent>
            </Card>

            {/* Pop-Up Markets Card */}
            <Card className="border-2 border-amber-200 shadow-xl bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-amber-900">Pop-Up Grocery Events</CardTitle>
                <CardDescription className="text-base text-amber-700 leading-relaxed">
                  Seasonal markets, tastings, and prepared food — meet the growers, shop culturally-rooted staples, and feel the full Uncle May's experience.
                </CardDescription>
                <div className="mt-4">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    South Side locations first
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <button 
                  className="text-amber-600 hover:text-amber-800 font-medium underline transition-colors duration-200"
                  onClick={() => {
                    // Track Facebook event
                    if (typeof window !== 'undefined' && (window as any).fbq) {
                      (window as any).fbq('track', 'ViewContent', {
                        content_name: 'Pop-Up Market Interest',
                        content_category: 'How It Works',
                        value: 15.00,
                        currency: 'USD'
                      });
                    }
                    document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Tell me when you're live →
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recognized By Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-amber-900">Recognized by</h2>
          
          {/* Organization Logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center mb-8">
            <div className="bg-white border border-amber-200 rounded-lg p-4 w-full h-24 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <img 
                src="/logos/polsky-center-logo.svg" 
                alt="Polsky Center for Entrepreneurship and Innovation - The University of Chicago"
                className="max-h-16 w-auto object-contain"
              />
            </div>
            <div className="bg-white border border-amber-200 rounded-lg p-4 w-full h-24 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <img 
                src="/logos/world-business-chicago-logo.svg" 
                alt="World Business Chicago"
                className="max-h-16 w-auto object-contain"
              />
            </div>
            <div className="bg-white border border-amber-200 rounded-lg p-4 w-full h-24 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <img 
                src="/logos/techrise-logo.svg" 
                alt="TechRise Powered by P33"
                className="max-h-16 w-auto object-contain"
              />
            </div>
            <div className="bg-white border border-amber-200 rounded-lg p-4 w-full h-24 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <img 
                src="/logos/naturally-chicago-logo.svg" 
                alt="Naturally Chicago"
                className="max-h-16 w-auto object-contain"
              />
            </div>
          </div>
          
          <p className="text-sm text-amber-600 max-w-2xl mx-auto">
            Backed by Chicago's premier food institutions and networks.
          </p>
        </div>
      </section>

      {/* Signup Form Section */}
      <section id="signup-form" className="py-20 px-4 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Be the first to shop with us</h2>
          <p className="text-xl md:text-2xl mb-12 opacity-95 font-light">
            Sign up for early access to produce boxes and pop-up locations. No cost today. We'll reach out before the next drop goes live.
          </p>
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl max-w-2xl mx-auto border border-amber-300/30">
            <BeautifulSubscribeForm variant="cta" />
          </div>
          <p className="text-sm text-amber-200 mt-6 max-w-xl mx-auto">
            We'll only email you about launch dates, pickup locations, and box availability. No spam.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-amber-200 bg-gradient-to-b from-amber-50/50 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <img 
              src="/uncle-mays-logo.png" 
              alt="UNCLE MAY'S Produce & Provisions" 
              className="h-12 w-auto object-contain mx-auto mb-4"
            />
            <h3 className="font-semibold mb-4 text-amber-900 text-lg">Follow Uncle May's Produce</h3>
            <p className="text-sm text-amber-700 leading-relaxed max-w-2xl mx-auto">
              Follow Uncle May's Produce as we build Chicago's next neighborhood grocery experience.
            </p>
          </div>
          
          <div className="flex justify-center space-x-6 mb-8">
            <a 
              href="https://instagram.com/unclemaysproduce" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-600 hover:text-amber-800 transition-colors duration-200 p-2 rounded-lg hover:bg-amber-100"
              aria-label="Follow us on Instagram"
              onClick={() => {
                // Track Facebook event
                if (typeof window !== 'undefined' && (window as any).fbq) {
                  (window as any).fbq('track', 'CustomEvent', {
                    event_name: 'Social Media Click',
                    content_name: 'Instagram',
                    content_category: 'Footer'
                  });
                }
              }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/108028133/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 hover:text-amber-800 transition-colors duration-200 p-2 rounded-lg hover:bg-amber-100"
              aria-label="Follow us on LinkedIn"
              onClick={() => {
                // Track Facebook event
                if (typeof window !== 'undefined' && (window as any).fbq) {
                  (window as any).fbq('track', 'CustomEvent', {
                    event_name: 'Social Media Click',
                    content_name: 'LinkedIn',
                    content_category: 'Footer'
                  });
                }
              }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
          
          
          <div className="border-t border-amber-200 pt-8 text-center text-sm text-amber-600">
            © 2025 UNCLE MAY'S Produce. Building community through fresh, local produce.
            <div className="mt-4 flex justify-center space-x-6">
              <Link 
                href="/privacy-policy" 
                className="text-amber-600 hover:text-amber-800 underline transition-colors duration-200"
                onClick={() => {
                  // Track Facebook event
                  if (typeof window !== 'undefined' && (window as any).fbq) {
                    (window as any).fbq('track', 'CustomEvent', {
                      event_name: 'Footer Link Click',
                      content_name: 'Privacy Policy',
                      content_category: 'Footer'
                    });
                  }
                }}
              >
                Privacy Policy
              </Link>
              <Link 
                href="/investors" 
                className="text-amber-600 hover:text-amber-800 underline transition-colors duration-200"
                onClick={() => {
                  // Track Facebook event
                  if (typeof window !== 'undefined' && (window as any).fbq) {
                    (window as any).fbq('track', 'CustomEvent', {
                      event_name: 'Footer Link Click',
                      content_name: 'Investor Portal',
                      content_category: 'Footer'
                    });
                  }
                }}
              >
                Investor Portal
              </Link>
              <a 
                href="mailto:info@unclemays.com"
                className="text-amber-600 hover:text-amber-800 underline transition-colors duration-200"
                onClick={() => {
                  // Track Facebook event
                  if (typeof window !== 'undefined' && (window as any).fbq) {
                    (window as any).fbq('track', 'CustomEvent', {
                      event_name: 'Footer Link Click',
                      content_name: 'Contact Us',
                      content_category: 'Footer'
                    });
                  }
                }}
              >
                Contact Us
              </a>
              <a 
                href="https://airtable.com/appHgPTKlcuFKajQp/pagSDGTyRCEaBKrNK/form"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:text-amber-800 underline transition-colors duration-200"
                onClick={() => {
                  // Track Facebook event
                  if (typeof window !== 'undefined' && (window as any).fbq) {
                    (window as any).fbq('track', 'CustomEvent', {
                      event_name: 'Footer Link Click',
                      content_name: 'Vendor Onboarding',
                      content_category: 'Footer'
                    });
                  }
                }}
              >
                Become a Vendor
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
