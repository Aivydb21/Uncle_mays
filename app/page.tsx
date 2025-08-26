import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, CheckCircle } from "lucide-react"
import { BeautifulSubscribeForm } from "@/components/BeautifulSubscribeForm"

import Image from "next/image"

export default function ProduceBoxDemandTesting() {
  return (
    <>
      {/* Structured Data for SEO and Social Media */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "UNCLE MAY'S Produce & Provisions",
            "description": "Chicago's first Black American grocery store. Get fresh produce from Black farmers across the local area and Southern United States delivered to your door, while supporting our community. Heritage since 1930.",
            "url": "https://unclemays.com",
            "logo": "https://unclemays.com/uncle-mays-logo.png",
            "image": "https://unclemays.com/hero-farmers.jpg",
            "telephone": "+1-XXX-XXX-XXXX",
            "email": "info@unclemays.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Chicago, IL",
              "addressLocality": "Chicago",
              "addressRegion": "IL",
              "postalCode": "60601",
              "addressCountry": "US"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "41.8781",
              "longitude": "-87.6298"
            },
            "openingHours": "Mo-Fr 09:00-18:00, Sa 09:00-16:00",
            "priceRange": "$$",
            "currenciesAccepted": "USD",
            "paymentAccepted": "Cash, Credit Card, Debit Card",
            "category": ["Grocery Store", "Farmers Market", "Black-Owned Business", "Community Business"],
            "sameAs": [
              "https://facebook.com/unclemays",
              "https://instagram.com/unclemays",
              "https://twitter.com/unclemays"
            ],
            "foundingDate": "1930",
            "areaServed": {
              "@type": "City",
              "name": "Chicago"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Fresh Produce & Provisions",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Fresh Produce from Black Farmers",
                    "description": "Locally and regionally sourced fresh produce from Black farmers"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Product",
                    "name": "Community Produce Boxes",
                    "description": "Curated produce boxes supporting local Black farmers"
                  }
                }
              ]
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5.0",
              "reviewCount": "50"
            }
          })
        }}
      />
      
      <div className="min-h-screen bg-background">
      {/* Header with Branding */}
      <header className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 border-b border-amber-200 py-8 px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-6 mb-6 md:mb-0">
            {/* Logo/Brand Area */}
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20">
                <Image
                  src="/uncle-mays-logo.png"
                  alt="Uncle May's Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="text-center md:text-left">
                <div className="text-4xl md:text-5xl font-bold text-amber-900 tracking-wider">
                  UNCLE MAY'S
                </div>
                <div className="text-base md:text-lg text-amber-700 font-medium">
                  Produce & Provisions
                </div>
              </div>
            </div>
          </div>
          
          {/* Heritage Badge */}
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 px-4 py-2 text-sm font-medium shadow-sm">
              Since 1930
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-amber-50 via-yellow-50 to-background py-32 px-6 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-farmers.jpg"
            alt="Black farmers working in fields"
            fill
            className="object-cover opacity-15"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50/85 via-yellow-50/80 to-background/90"></div>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-10 px-8 py-4 text-base font-medium shadow-lg bg-amber-100 text-amber-800 border-amber-200">
            🌱 Black-Owned • Community-Focused • Farm-Fresh
          </Badge>
          
          {/* Main Branding */}
          <div className="mb-10">
            <h1 className="text-6xl md:text-8xl font-bold text-amber-900 mb-6 leading-tight tracking-wider">
              UNCLE MAY'S
            </h1>
            <div className="text-4xl md:text-5xl font-bold text-amber-700 mb-3">
              Produce & Provisions
            </div>
            <div className="text-2xl md:text-3xl font-semibold text-amber-600">
              Supporting Black Farmers
            </div>
          </div>
          
          <p className="text-2xl md:text-3xl text-amber-800 mb-16 max-w-4xl mx-auto leading-relaxed font-light">
            Chicago's first Black American grocery store. Get fresh produce from Black farmers across the local
            area and Southern United States delivered to your door, while supporting our community.
          </p>

          {/* Beautiful Custom Form */}
          <div className="bg-white/90 backdrop-blur-md p-12 rounded-3xl shadow-2xl max-w-2xl mx-auto mb-20 border border-amber-200">
            <BeautifulSubscribeForm variant="hero" />
          </div>


        </div>
      </section>

      {/* Value Proposition Cards */}
      <section className="py-24 px-6 bg-gradient-to-b from-amber-50/40 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-amber-900">Why UNCLE MAY'S?</h2>
            <div className="flex justify-center items-center space-x-6 mb-8">
              <div className="w-20 h-px bg-amber-300"></div>
              <span className="text-amber-600 text-xl font-medium">🌾 Heritage & Community 🌾</span>
              <div className="w-20 h-px bg-amber-300"></div>
            </div>
            <p className="text-xl text-amber-700 max-w-3xl mx-auto leading-relaxed">
              Building on nearly a century of tradition, we're bringing fresh produce and community connection to Hyde Park
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <Card className="text-center border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-8">
                <div className="relative w-28 h-28 mx-auto mb-8 rounded-3xl overflow-hidden border-2 border-amber-200 shadow-lg">
                  <Image
                    src="/farmer-sam-crawford.jpg"
                    alt="Farmer Sam Crawford representing Black farmers"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardTitle className="text-2xl text-amber-900">Supporting Black Farmers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-amber-700 leading-relaxed">
                  Every purchase directly supports Black farmers from Chicago and across the Southern United States,
                  building wealth within our community.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-8">
                <div className="relative w-28 h-28 mx-auto mb-8 rounded-3xl overflow-hidden border-2 border-amber-200 shadow-lg">
                  <Image
                    src="/hyde-park-community.jpg"
                    alt="Hyde Park Community"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardTitle className="text-2xl text-amber-900">Hyde Park & Beyond</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-amber-700 leading-relaxed">
                  Starting in Hyde Park, Chicago, we're building the first scalable Black American grocery experience
                  with pop-ups and delivery.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-8">
                <div className="relative w-28 h-28 mx-auto mb-8 rounded-3xl overflow-hidden border-2 border-amber-200 shadow-lg">
                  <Image
                    src="/fresh-produce.jpg"
                    alt="Fresh farm produce"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardTitle className="text-2xl text-amber-900">Farm Fresh Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg text-amber-700 leading-relaxed">
                  Handpicked seasonal produce from trusted Black-owned farms, delivered fresh to preserve flavor,
                  nutrition, and cultural heritage.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Historical Heritage Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-amber-50/50 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold mb-8 text-amber-900">Our Heritage Since 1930</h2>
              <div className="flex justify-start items-center space-x-4 mb-8">
                <div className="w-16 h-px bg-amber-300"></div>
                <span className="text-amber-600 text-xl font-medium">🌾 Generations of Community 🌾</span>
              </div>
              <p className="text-xl text-amber-700 mb-10 leading-relaxed">
                For nearly a century, Uncle May's has been at the heart of our community, connecting families with 
                the freshest produce from trusted Black farmers. This photo from 1939 shows our neighbors and 
                tenant farmers sharing meals together - a tradition we continue today.
              </p>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-amber-700 text-lg">Nearly 100 years of community trust</span>
                </div>
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-amber-700 text-lg">Multi-generational farmer relationships</span>
                </div>
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-amber-700 text-lg">Preserving Southern farming traditions</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative w-full h-[28rem] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/neighbors-tenant-farmers-1939.jpg"
                  alt="Neighbors and tenant farmers eating together in 1939"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-amber-100 text-amber-800 px-6 py-3 rounded-xl border-2 border-amber-200 shadow-lg">
                <span className="text-base font-semibold">1939 - Community Meals</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 px-6 bg-gradient-to-b from-amber-50/50 to-background">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-amber-900">Produce Box Options</h2>
          <div className="flex justify-center items-center space-x-6 mb-8">
            <div className="w-16 h-px bg-amber-300"></div>
            <span className="text-amber-600 text-xl font-medium">🌾 Fresh from Black Farmers 🌾</span>
            <div className="w-16 h-px bg-amber-300"></div>
          </div>
          <p className="text-2xl text-amber-700 mb-16 max-w-3xl mx-auto">Help us understand what works best for your family</p>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <Card className="relative border-2 border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-8">
                <CardTitle className="text-3xl text-amber-900">Community Box</CardTitle>
                <div className="text-5xl font-bold text-amber-600 mb-3">$25</div>
                <CardDescription className="text-lg text-amber-700">Perfect for 1-2 people</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-base text-amber-700">5-7 seasonal items from Black farmers</span>
                </div>
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-base text-amber-700">Traditional Southern recipes included</span>
                </div>
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-base text-amber-700">Chicago area delivery</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-amber-400 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-b from-amber-50/60 to-white/90 backdrop-blur-sm">
              <Badge className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white px-6 py-3 text-base font-semibold shadow-xl">
                Most Interest
              </Badge>
              <CardHeader className="pb-8">
                <CardTitle className="text-3xl text-amber-900">Family Heritage Box</CardTitle>
                <div className="text-5xl font-bold text-amber-600 mb-3">$45</div>
                <CardDescription className="text-lg text-amber-700">Great for 3-5 people</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-base text-amber-700">10-12 seasonal items from Black farmers</span>
                </div>
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-base text-amber-700">Traditional Southern recipes included</span>
                </div>
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-base text-amber-700">Chicago area delivery</span>
                </div>
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-base text-amber-700">Farmer spotlight stories</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-amber-700 mt-16 text-xl">
            These are test prices to gauge interest. Final pricing will be shared with our community first.
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-20 text-amber-900">Our Community Speaks</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <Card className="border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
              <CardContent className="pt-10">
                <div className="flex justify-center mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-amber-500 text-amber-500 mx-1" />
                  ))}
                </div>
                <p className="text-lg mb-8 text-amber-700 leading-relaxed italic">
                  "Finally, a way to support Black farmers while getting amazing fresh produce. This is what our
                  community needs!"
                </p>
                <div className="text-lg font-semibold text-amber-900">Keisha J.</div>
                <div className="text-base text-amber-600">Hyde Park Resident</div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
              <CardContent className="pt-10">
                <div className="flex justify-center mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-amber-500 text-amber-500 mx-1" />
                  ))}
                </div>
                <p className="text-lg mb-8 text-amber-700 leading-relaxed italic">
                  "Love the mission and the quality. It's about time we had something like this in Chicago. Can't wait
                  for the pop-ups!"
                </p>
                <div className="text-lg font-semibold text-amber-900">Marcus T.</div>
                <div className="text-base text-amber-600">South Side Chicago</div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
              <CardContent className="pt-10">
                <div className="flex justify-center mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-amber-500 text-amber-500 mx-1" />
                  ))}
                </div>
                <p className="text-lg mb-8 text-amber-700 leading-relaxed italic">
                  "The produce reminds me of my grandmother's garden down South. Supporting Black farmers feels so
                  good."
                </p>
                <div className="text-lg font-semibold text-amber-900">Angela M.</div>
                <div className="text-base text-amber-600">Community Member</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">Join the Movement</h2>
          <div className="flex justify-center items-center space-x-6 mb-8">
            <div className="w-16 h-px bg-amber-300"></div>
            <span className="text-amber-200 text-xl font-medium">🌾 Heritage & Community 🌾</span>
            <div className="w-16 h-px bg-amber-300"></div>
          </div>
          <p className="text-2xl md:text-3xl mb-16 opacity-95 font-light">
            Be part of building Chicago's first Black American grocery experience. Get notified about pop-ups
            and produce boxes.
          </p>
          <div className="bg-white/15 backdrop-blur-md p-10 rounded-3xl max-w-2xl mx-auto border border-amber-300/40">
            <BeautifulSubscribeForm variant="cta" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-amber-200 bg-gradient-to-b from-amber-50/60 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-semibold mb-8 text-amber-900 text-xl">UNCLE MAY'S Produce</h3>
              <p className="text-base text-amber-700 leading-relaxed">
                Chicago's first Black American grocery store, connecting our community with Black farmers
                across the local area and Southern United States.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-6 text-amber-900 text-lg">Our Mission</h4>
              <div className="space-y-4 text-base text-amber-700">
                <div>Supporting Black Farmers</div>
                <div>Community Impact</div>
                <div>Fresh Local Produce</div>
              </div>
            </div>
          </div>
          <div className="border-t border-amber-200 mt-16 pt-10 text-center text-base text-amber-600">
            © 2025 UNCLE MAY'S Produce. Building community through fresh, local produce since 1930.
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}
