import { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { BeautifulSubscribeForm } from '@/components/BeautifulSubscribeForm'
import { ArrowRight, Download, Users, TrendingUp, MapPin, DollarSign } from 'lucide-react'

export const metadata: Metadata = {
  title: "Investors - UNCLE MAY'S Produce & Provisions",
  description: "Investment opportunity in Chicago's first Black American grocery store. Supporting Black farmers and building community through fresh produce delivery.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://unclemays.com/investors',
  },
}

export default function InvestorsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200 py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-center md:text-left">
            <div className="text-3xl md:text-4xl font-bold text-amber-900 tracking-wider">
              UNCLE MAY'S
            </div>
            <div className="text-sm md:text-base text-amber-700 font-medium">
              Produce & Provisions
            </div>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 px-4 py-2">
            💼 Investor Portal
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-amber-900 mb-6">
            Investment Opportunity
          </h1>
          <p className="text-xl md:text-2xl text-amber-800 mb-8 leading-relaxed">
            Join us in building Chicago's first Black American grocery store and supporting Black farmers across the community.
          </p>
          
          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="border-amber-200 shadow-lg bg-white/80">
              <CardContent className="pt-6 text-center">
                <MapPin className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-amber-900">Chicago</div>
                <div className="text-sm text-amber-700">Target Market</div>
              </CardContent>
            </Card>
            
            <Card className="border-amber-200 shadow-lg bg-white/80">
              <CardContent className="pt-6 text-center">
                <Users className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-amber-900">Black Farmers</div>
                <div className="text-sm text-amber-700">Community Focus</div>
              </CardContent>
            </Card>
            
            <Card className="border-amber-200 shadow-lg bg-white/80">
              <CardContent className="pt-6 text-center">
                <TrendingUp className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-amber-900">Growing</div>
                <div className="text-sm text-amber-700">Market Demand</div>
              </CardContent>
            </Card>
            
            <Card className="border-amber-200 shadow-lg bg-white/80">
              <CardContent className="pt-6 text-center">
                <DollarSign className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-amber-900">Scalable</div>
                <div className="text-sm text-amber-700">Business Model</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Investment Highlights */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-6">Why Invest in UNCLE MAY'S?</h2>
            <div className="flex justify-center items-center space-x-4 mb-6">
              <div className="w-16 h-px bg-amber-300"></div>
              <span className="text-amber-600 text-lg">🌾 Community Impact & Growth 🌾</span>
              <div className="w-16 h-px bg-amber-300"></div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10">
            <Card className="border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80">
              <CardHeader>
                <CardTitle className="text-xl text-amber-900">Market Opportunity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-amber-700">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>First Black American grocery store in Chicago</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Growing demand for fresh, local produce</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Supporting Black farmers and community wealth</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Scalable delivery and pop-up model</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80">
              <CardHeader>
                <CardTitle className="text-xl text-amber-900">Business Model</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-amber-700">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Produce box subscriptions ($25-$45)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Pop-up store events in Hyde Park</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Direct partnerships with Black farmers</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Community-driven growth strategy</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pitch Deck Access */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-6">
            Access Our Pitch Deck
          </h2>
          <p className="text-lg text-amber-700 mb-8 max-w-2xl mx-auto">
            Get detailed financial projections, market analysis, and growth strategy in our comprehensive investor presentation.
          </p>
          
          {/* Email Signup for Pitch Deck */}
          <Card className="max-w-2xl mx-auto border-amber-200 shadow-xl bg-white/90">
            <CardHeader>
              <CardTitle className="text-2xl text-amber-900">Request Pitch Deck Access</CardTitle>
              <CardDescription className="text-amber-700">
                Provide your email to receive access to our detailed investor presentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BeautifulSubscribeForm variant="hero" />
            </CardContent>
          </Card>

          {/* Direct Link to Pitch Deck */}
          <div className="mt-8">
            <Button 
              asChild
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 text-lg"
            >
              <a 
                href="https://publuu.com/flip-book/996063/2195625" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>View Pitch Deck</span>
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
            <p className="text-sm text-amber-600 mt-4">
              Click to view our interactive pitch deck presentation
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Invest?</h2>
          <p className="text-xl mb-8 opacity-95">
            Join us in building a sustainable future for Black farmers and communities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              size="lg"
              className="bg-white text-amber-700 hover:bg-amber-50 px-8 py-4"
            >
              <a href="mailto:investors@unclemays.com" className="flex items-center space-x-2">
                <span>Contact Our Team</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <Button 
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-amber-700 px-8 py-4"
            >
              <a href="https://publuu.com/flip-book/996063/2195625" target="_blank" rel="noopener noreferrer">
                View Full Presentation
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-amber-200 bg-gradient-to-b from-amber-50/50 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-sm text-amber-600">
            © 2025 UNCLE MAY'S Produce. Building community through fresh, local produce.
          </div>
        </div>
      </footer>
    </div>
  )
}
