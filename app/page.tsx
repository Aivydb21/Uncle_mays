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
      <header className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100 border-b border-amber-200 py-4 sm:py-6 lg:py-8 px-4 sm:px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-6">
            {/* Logo/Brand Area */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                <Image
                  src="/uncle-mays-logo.png"
                  alt="Uncle May's Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-amber-900 tracking-wider leading-tight">
                  UNCLE MAY'S
                </div>
                <div className="text-sm sm:text-base lg:text-lg text-amber-700 font-medium">
                  Produce & Provisions
                </div>
              </div>
            </div>
          </div>
          
          {/* Heritage Badge */}
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium shadow-sm">
              Since 1930
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-amber-50 via-yellow-50 to-background py-16 sm:py-20 lg:py-32 px-4 sm:px-6 overflow-hidden">
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
          <Badge variant="secondary" className="mb-6 sm:mb-8 lg:mb-10 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-sm sm:text-base font-medium shadow-lg bg-amber-100 text-amber-800 border-amber-200">
            🌱 Black-Owned • Community-Focused • Farm-Fresh
          </Badge>
          
          {/* Main Branding */}
          <div className="mb-6 sm:mb-8 lg:mb-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-amber-900 mb-4 sm:mb-6 leading-tight tracking-wider">
              UNCLE MAY'S
            </h1>
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-amber-700 mb-2 sm:mb-3">
              Produce & Provisions
            </div>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-amber-600">
              Supporting Black Farmers
            </div>
          </div>
          
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-amber-800 mb-8 sm:mb-12 lg:mb-16 max-w-4xl mx-auto leading-relaxed font-light px-4">
            Chicago's first Black American grocery store. Get fresh produce from Black farmers across the local
            area and Southern United States delivered to your door, while supporting our community.
          </p>

          {/* Beautiful Custom Form */}
          <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl mx-auto mb-12 sm:mb-16 lg:mb-20 border border-amber-200">
            <BeautifulSubscribeForm variant="hero" />
          </div>


        </div>
      </section>

      {/* Value Proposition Cards */}
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 bg-gradient-to-b from-amber-50/40 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 text-amber-900">Why UNCLE MAY'S?</h2>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-6 mb-6 sm:mb-8">
              <div className="hidden sm:block w-16 lg:w-20 h-px bg-amber-300"></div>
              <span className="text-amber-600 text-lg sm:text-xl font-medium">🌾 Heritage & Community 🌾</span>
              <div className="hidden sm:block w-16 lg:w-20 h-px bg-amber-300"></div>
            </div>
            <p className="text-lg sm:text-xl text-amber-700 max-w-3xl mx-auto leading-relaxed px-4">
              Building on nearly a century of tradition, we're bringing fresh produce and community connection to Hyde Park
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            <Card className="text-center border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6 sm:pb-8">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mx-auto mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-200 shadow-lg">
                  <Image
                    src="/farmer-sam-crawford.jpg"
                    alt="Farmer Sam Crawford representing Black farmers"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-amber-900">Supporting Black Farmers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base sm:text-lg text-amber-700 leading-relaxed">
                  Every purchase directly supports Black farmers from Chicago and across the Southern United States,
                  building wealth within our community.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6 sm:pb-8">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mx-auto mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-200 shadow-lg">
                  <Image
                    src="/hyde-park-community.jpg"
                    alt="Hyde Park Community"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-amber-900">Hyde Park & Beyond</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base sm:text-lg text-amber-700 leading-relaxed">
                  Starting in Hyde Park, Chicago, we're building the first scalable Black American grocery experience
                  with pop-ups and delivery.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6 sm:pb-8">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mx-auto mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-200 shadow-lg">
                  <Image
                    src="/fresh-produce.jpg"
                    alt="Fresh farm produce"
                    fill
                    className="object-cover"
                  />
                </div>
                <CardTitle className="text-xl sm:text-2xl text-amber-900">Farm Fresh Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base sm:text-lg text-amber-700 leading-relaxed">
                  Handpicked seasonal produce from trusted Black-owned farms, delivered fresh to preserve flavor,
                  nutrition, and cultural heritage.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Historical Heritage Section */}
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 bg-gradient-to-b from-amber-50/50 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 text-amber-900">Our Heritage Since 1930</h2>
              <div className="flex flex-col sm:flex-row justify-start items-center sm:space-x-4 mb-6 sm:mb-8 space-y-3 sm:space-y-0">
                <div className="hidden sm:block w-12 lg:w-16 h-px bg-amber-300"></div>
                <span className="text-amber-600 text-lg sm:text-xl font-medium">🌾 Generations of Community 🌾</span>
              </div>
              <p className="text-lg sm:text-xl text-amber-700 mb-8 sm:mb-10 leading-relaxed">
                For nearly a century, Uncle May's has been at the heart of our community, connecting families with 
                the freshest produce from trusted Black farmers. This photo from 1939 shows our neighbors and 
                tenant farmers sharing meals together - a tradition we continue today.
              </p>
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-center gap-3 sm:gap-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-base sm:text-lg text-amber-700">Nearly 100 years of community trust</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-base sm:text-lg text-amber-700">Multi-generational farmer relationships</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-base sm:text-lg text-amber-700">Preserving Southern farming traditions</span>
                </div>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="relative w-full h-64 sm:h-80 lg:h-[28rem] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/neighbors-tenant-farmers-1939.jpg"
                  alt="Neighbors and tenant farmers eating together in 1939"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-3 sm:-bottom-6 -left-3 sm:-left-6 bg-amber-100 text-amber-800 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-amber-200 shadow-lg">
                <span className="text-sm sm:text-base font-semibold">1939 - Community Meals</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 bg-gradient-to-b from-amber-50/50 to-background">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 text-amber-900">Produce Box Options</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-6 mb-6 sm:mb-8">
            <div className="hidden sm:block w-12 lg:w-16 h-px bg-amber-300"></div>
            <span className="text-amber-600 text-lg sm:text-xl font-medium">🌾 Fresh from Black Farmers 🌾</span>
            <div className="hidden sm:block w-12 lg:w-16 h-px bg-amber-300"></div>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl text-amber-700 mb-12 sm:mb-16 max-w-3xl mx-auto px-4">Help us understand what works best for your family</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-4xl mx-auto">
            <Card className="relative border-2 border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-6 sm:pb-8">
                <CardTitle className="text-2xl sm:text-3xl text-amber-900">Community Box</CardTitle>
                <div className="text-4xl sm:text-5xl font-bold text-amber-600 mb-2 sm:mb-3">$25</div>
                <CardDescription className="text-base sm:text-lg text-amber-700">Perfect for 1-2 people</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-5">
                <div className="flex items-center gap-3 sm:gap-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-amber-700">5-7 seasonal items from Black farmers</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-amber-700">Traditional Southern recipes included</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-amber-700">Chicago area delivery</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative border-2 border-amber-400 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-b from-amber-50/60 to-white/90 backdrop-blur-sm">
              <Badge className="absolute -top-4 sm:-top-6 left-1/2 transform -translate-x-1/2 bg-amber-600 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold shadow-xl">
                Most Interest
              </Badge>
              <CardHeader className="pb-6 sm:pb-8">
                <CardTitle className="text-2xl sm:text-3xl text-amber-900">Family Heritage Box</CardTitle>
                <div className="text-4xl sm:text-5xl font-bold text-amber-600 mb-2 sm:mb-3">$45</div>
                <CardDescription className="text-base sm:text-lg text-amber-700">Great for 3-5 people</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-5">
                <div className="flex items-center gap-3 sm:gap-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-amber-700">10-12 seasonal items from Black farmers</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-amber-700">Traditional Southern recipes included</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-amber-700">Chicago area delivery</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-amber-700">Farmer spotlight stories</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <p className="text-amber-700 mt-12 sm:mt-16 text-lg sm:text-xl px-4">
            These are test prices to gauge interest. Final pricing will be shared with our community first.
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-12 sm:mb-16 lg:mb-20 text-amber-900">Our Community Speaks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            <Card className="border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
              <CardContent className="pt-8 sm:pt-10">
                <div className="flex justify-center mb-6 sm:mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-500 text-amber-500 mx-1" />
                  ))}
                </div>
                <p className="text-base sm:text-lg mb-6 sm:mb-8 text-amber-700 leading-relaxed italic">
                  "Finally, a way to support Black farmers while getting amazing fresh produce. This is what our
                  community needs!"
                </p>
                <div className="text-base sm:text-lg font-semibold text-amber-900">Keisha J.</div>
                <div className="text-sm sm:text-base text-amber-600">Hyde Park Resident</div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
              <CardContent className="pt-8 sm:pt-10">
                <div className="flex justify-center mb-6 sm:mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-500 text-amber-500 mx-1" />
                  ))}
                </div>
                <p className="text-base sm:text-lg mb-6 sm:mb-8 text-amber-700 leading-relaxed italic">
                  "Love the mission and the quality. It's about time we had something like this in Chicago. Can't wait
                  for the pop-ups!"
                </p>
                <div className="text-base sm:text-lg font-semibold text-amber-900">Marcus T.</div>
                <div className="text-sm sm:text-base text-amber-600">South Side Chicago</div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
              <CardContent className="pt-8 sm:pt-10">
                <div className="flex justify-center mb-6 sm:mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-500 text-amber-500 mx-1" />
                  ))}
                </div>
                <p className="text-base sm:text-lg mb-6 sm:mb-8 text-amber-700 leading-relaxed italic">
                  "The produce reminds me of my grandmother's garden down South. Supporting Black farmers feels so
                  good."
                </p>
                <div className="text-base sm:text-lg font-semibold text-amber-900">Angela M.</div>
                <div className="text-sm sm:text-base text-amber-600">Community Member</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8">Join the Movement</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-6 mb-6 sm:mb-8">
            <div className="hidden sm:block w-12 lg:w-16 h-px bg-amber-300"></div>
            <span className="text-amber-200 text-lg sm:text-xl font-medium">🌾 Heritage & Community 🌾</span>
            <div className="hidden sm:block w-12 lg:w-16 h-px bg-amber-300"></div>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-12 sm:mb-16 opacity-95 font-light px-4">
            Be part of building Chicago's first Black American grocery experience. Get notified about pop-ups
            and produce boxes.
          </p>
          <div className="bg-white/15 backdrop-blur-md p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl max-w-2xl mx-auto border border-amber-300/40">
            <BeautifulSubscribeForm variant="cta" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 border-t border-amber-200 bg-gradient-to-b from-amber-50/60 to-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h3 className="font-semibold mb-6 sm:mb-8 text-amber-900 text-lg sm:text-xl">UNCLE MAY'S Produce</h3>
              <p className="text-sm sm:text-base text-amber-700 leading-relaxed">
                Chicago's first Black American grocery store, connecting our community with Black farmers
                across the local area and Southern United States.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4 sm:mb-6 text-amber-900 text-base sm:text-lg">Our Mission</h4>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-amber-700">
                <div>Supporting Black Farmers</div>
                <div>Community Impact</div>
                <div>Fresh Local Produce</div>
              </div>
            </div>
          </div>
          <div className="border-t border-amber-200 mt-12 sm:mt-16 pt-8 sm:pt-10 text-center text-sm sm:text-base text-amber-600">
            © 2025 UNCLE MAY'S Produce. Building community through fresh, local produce since 1930.
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}
