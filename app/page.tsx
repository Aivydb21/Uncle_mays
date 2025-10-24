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
            <div className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-bold text-amber-900 tracking-wider">
                UNCLE MAY'S
              </div>
              <div className="text-sm md:text-base text-amber-700 font-medium">
                Produce & Provisions
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
              Fresh. Local. Ours.
            </h1>
            <p className="text-xl md:text-2xl text-amber-800 mb-4 max-w-3xl mx-auto leading-relaxed font-medium">
              Be first to get Uncle May's Produce — curated boxes from Black farmers and limited pop-up market events across Chicago.
            </p>
            <p className="text-lg text-amber-700 mb-12 max-w-2xl mx-auto">
              We're launching soon. Tell us how you want in.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4 mb-16">
            <Button 
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => {
                // Track hero CTA click
                if (typeof window !== 'undefined' && (window as any).gtag) {
                  (window as any).gtag('event', 'hero_cta_click', {
                    event_category: 'engagement',
                    event_label: 'Join Early Access List'
                  });
                }
                // Scroll to signup form
                document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Join the Early Access List →
            </Button>
            <div>
              <button 
                className="text-amber-600 hover:text-amber-800 text-sm font-medium underline transition-colors duration-200"
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                See how it works ↓
              </button>
            </div>
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
          
          <div className="grid md:grid-cols-3 gap-10 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-200">
                <Leaf className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900 mb-3">Fresh produce grown by Black farmers</h3>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-200">
                <Users className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900 mb-3">Prepared foods + culturally-rooted flavors</h3>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-200">
                <MapPin className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900 mb-3">Circulating dollars back into our community</h3>
            </div>
          </div>

          <div className="text-center">
            <button 
              className="text-amber-600 hover:text-amber-800 font-medium underline transition-colors duration-200"
              onClick={() => {
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
              className="text-amber-600 hover:text-amber-800 transition-colors duration-200"
            >
              <span className="text-lg font-medium">Instagram</span>
            </a>
                        <a
                          href="https://www.linkedin.com/company/108028133/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-600 hover:text-amber-800 transition-colors duration-200"
                        >
                          <span className="text-lg font-medium">LinkedIn</span>
                        </a>
            <a 
              href="mailto:info@unclemays.com"
              className="text-amber-600 hover:text-amber-800 transition-colors duration-200"
            >
              <span className="text-lg font-medium">Email</span>
            </a>
          </div>
          
          {/* Investor Portal Button */}
          <div className="text-center mb-8">
            <Button
              asChild
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 px-6 py-2"
            >
              <Link
                href="/investors"
                className="flex items-center space-x-2"
              >
                <span>💼 Investor Portal</span>
              </Link>
            </Button>
          </div>
          
          <div className="border-t border-amber-200 pt-8 text-center text-sm text-amber-600">
            © 2025 UNCLE MAY'S Produce. Building community through fresh, local produce.
            <div className="mt-4">
              <Link 
                href="/privacy-policy" 
                className="text-amber-600 hover:text-amber-800 underline transition-colors duration-200"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
