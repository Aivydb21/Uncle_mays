import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Leaf, Star, CheckCircle, MapPin, Users } from "lucide-react"
import { BeautifulSubscribeForm } from "@/components/BeautifulSubscribeForm"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "UNCLE MAY'S Produce & Provisions - Supporting Black Farmers",
  description: "Chicago's first Black American grocery store. Get fresh produce from Black farmers across the local area and Southern United States delivered to your door, while supporting our community. Heritage since 1930.",
  alternates: {
    canonical: 'https://unclemays.com/',
  },
  openGraph: {
    title: "UNCLE MAY'S Produce & Provisions - Supporting Black Farmers",
    description: "Chicago's first Black American grocery store. Get fresh produce from Black farmers across the local area and Southern United States delivered to your door, while supporting our community. Heritage since 1930.",
    url: 'https://unclemays.com/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "UNCLE MAY'S Produce & Provisions - Supporting Black Farmers",
    description: "Chicago's first Black American grocery store. Get fresh produce from Black farmers across the local area and Southern United States delivered to your door, while supporting our community. Heritage since 1930.",
  },
}

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
            🌱 Black-Owned • Community-Focused • Farm-Fresh
          </Badge>
          
          {/* Main Branding */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-amber-900 mb-4 leading-tight tracking-wider">
              UNCLE MAY'S
            </h1>
            <div className="text-3xl md:text-4xl font-bold text-amber-700 mb-2">
              Produce & Provisions
            </div>
            <div className="text-xl md:text-2xl font-semibold text-amber-600">
              Supporting Black Farmers
            </div>
          </div>
          
          <p className="text-xl md:text-2xl text-amber-800 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Chicago's first Black American grocery store. Get fresh produce from Black farmers across the local
            area and Southern United States delivered to your door, while supporting our community.
          </p>

          {/* Beautiful Custom Form */}
          <div className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-xl max-w-2xl mx-auto mb-16 border border-amber-200">
            <BeautifulSubscribeForm variant="hero" />
          </div>
        </div>
      </section>

      {/* Value Proposition Cards */}
      <section className="py-20 px-4 bg-gradient-to-b from-amber-50/30 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-amber-900">Why UNCLE MAY'S?</h2>
            <div className="flex justify-center items-center space-x-4 mb-6">
              <div className="w-16 h-px bg-amber-300"></div>
              <span className="text-amber-600 text-lg">🌾 Heritage & Community 🌾</span>
              <div className="w-16 h-px bg-amber-300"></div>
            </div>
            <p className="text-lg text-amber-700 max-w-2xl mx-auto">
              Building on nearly a century of tradition, we're bringing fresh produce and community connection to Hyde Park
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <Card className="text-center border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80">
              <CardHeader className="pb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-200">
                  <Users className="w-8 h-8 text-amber-700" />
                </div>
                <CardTitle className="text-xl text-amber-900">Supporting Black Farmers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-amber-700 leading-relaxed">
                  Every purchase directly supports Black farmers from Chicago and across the Southern United States,
                  building wealth within our community.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80">
              <CardHeader className="pb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-200">
                  <MapPin className="w-8 h-8 text-amber-700" />
                </div>
                <CardTitle className="text-xl text-amber-900">Hyde Park & Beyond</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-amber-700 leading-relaxed">
                  Starting in Hyde Park, Chicago, we're building the first scalable Black American grocery experience
                  with pop-ups and delivery.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80">
              <CardHeader className="pb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-200">
                  <Leaf className="w-8 h-8 text-amber-700" />
                </div>
                <CardTitle className="text-xl text-amber-900">Farm Fresh Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-amber-700 leading-relaxed">
                  Handpicked seasonal produce from trusted Black-owned farms, delivered fresh to preserve flavor,
                  nutrition, and cultural heritage.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4 bg-gradient-to-b from-amber-50/50 to-background">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-amber-900">Produce Box Options</h2>
          <div className="flex justify-center items-center space-x-4 mb-6">
            <div className="w-12 h-px bg-amber-300"></div>
            <span className="text-amber-600 text-lg">🌾 Fresh from Black Farmers 🌾</span>
            <div className="w-12 h-px bg-amber-300"></div>
          </div>
          <p className="text-xl text-amber-700 mb-12 max-w-2xl mx-auto">Help us understand what works best for your family</p>
          <div className="grid md:grid-cols-2 gap-10 max-w-3xl mx-auto">
            <Card className="relative border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-amber-900">Community Box</CardTitle>
                <div className="text-4xl font-bold text-amber-600 mb-2">$25</div>
                <CardDescription className="text-base text-amber-700">Perfect for 1-2 people</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-sm text-amber-700">5-7 seasonal items from Black farmers</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-sm text-amber-700">Traditional Southern recipes included</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-sm text-amber-700">Chicago area delivery</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-amber-400 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-b from-amber-50/50 to-white/80">
              <Badge className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white px-4 py-2 text-sm font-medium shadow-lg">
                Most Interest
              </Badge>
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-amber-900">Family Heritage Box</CardTitle>
                <div className="text-4xl font-bold text-amber-600 mb-2">$45</div>
                <CardDescription className="text-base text-amber-700">Great for 3-5 people</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-sm text-amber-700">10-12 seasonal items from Black farmers</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-sm text-amber-700">Traditional Southern recipes included</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-sm text-amber-700">Chicago area delivery</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-sm text-amber-700">Farmer spotlight stories</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16 text-amber-900">Our Community Speaks</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <Card className="border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80">
              <CardContent className="pt-8">
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500 mx-0.5" />
                  ))}
                </div>
                <p className="text-base mb-6 text-amber-700 leading-relaxed italic">
                  "Finally, a way to support Black farmers while getting amazing fresh produce. This is what our
                  community needs!"
                </p>
                <div className="text-base font-semibold text-amber-900">Keisha J.</div>
                <div className="text-sm text-amber-600">Hyde Park Resident</div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80">
              <CardContent className="pt-8">
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500 mx-0.5" />
                  ))}
                </div>
                <p className="text-base mb-6 text-amber-700 leading-relaxed italic">
                  "Love the mission and the quality. It's about time we had something like this in Chicago. Can't wait
                  for the pop-ups!"
                </p>
                <div className="text-base font-semibold text-amber-900">Marcus T.</div>
                <div className="text-sm text-amber-600">South Side Chicago</div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80">
              <CardContent className="pt-8">
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500 mx-0.5" />
                  ))}
                </div>
                <p className="text-base mb-6 text-amber-700 leading-relaxed italic">
                  "The produce reminds me of my grandmother's garden down South. Supporting Black farmers feels so
                  good."
                </p>
                <div className="text-base font-semibold text-amber-900">Angela M.</div>
                <div className="text-sm text-amber-600">Community Member</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Join the Movement</h2>
          <div className="flex justify-center items-center space-x-4 mb-6">
            <div className="w-12 h-px bg-amber-300"></div>
            <span className="text-amber-200 text-lg">🌾 Heritage & Community 🌾</span>
            <div className="w-12 h-px bg-amber-300"></div>
          </div>
          <p className="text-xl md:text-2xl mb-12 opacity-95 font-light">
            Be part of building Chicago's first Black American grocery experience. Get notified about pop-ups
            and produce boxes.
          </p>
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl max-w-2xl mx-auto border border-amber-300/30">
            <BeautifulSubscribeForm variant="cta" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-amber-200 bg-gradient-to-b from-amber-50/50 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h3 className="font-semibold mb-6 text-amber-900 text-lg">UNCLE MAY'S Produce</h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                Chicago's first Black American grocery store, connecting our community with Black farmers
                across the local area and Southern United States.
              </p>
            </div>
          </div>
          <div className="border-t border-amber-200 mt-12 pt-8 text-center text-sm text-amber-600">
            © 2025 UNCLE MAY'S Produce. Building community through fresh, local produce since 1930.
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
