import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Privacy Policy - UNCLE MAY'S Produce & Provisions",
  description: "Privacy policy for UNCLE MAY'S Produce & Provisions. Learn how we protect your personal information and data privacy.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://unclemays.com/privacy-policy',
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Your privacy is important to us
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 mb-6 leading-relaxed">
                Uncle May's Produce respects your privacy. The information you provide (such as your name and email address) will only be used to send you updates, promotions, and information about our products and services. We do not sell, rent, or share your personal information with third parties.
              </p>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                You may unsubscribe from our communications at any time by clicking the "unsubscribe" link in our emails or by contacting us directly at{' '}
                <a 
                  href="mailto:info@unclemays.com" 
                  className="text-green-600 hover:text-green-800 underline"
                >
                  info@unclemays.com
                </a>.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                For questions about this policy, please contact us at:{' '}
                <a 
                  href="mailto:info@unclemays.com" 
                  className="text-green-600 hover:text-green-800 underline"
                >
                  info@unclemays.com
                </a>.
              </p>
            </div>
          </div>

          {/* Additional Privacy Information */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Additional Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Information We Collect
                </h3>
                <p className="text-gray-700">
                  We collect information you provide directly to us, such as when you subscribe to our newsletter, place an order, or contact us for support.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  How We Use Your Information
                </h3>
                <p className="text-gray-700">
                  We use the information we collect to provide, maintain, and improve our services, communicate with you, and send you marketing materials (with your consent).
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Data Security
                </h3>
                <p className="text-gray-700">
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Updates to This Policy
                </h3>
                <p className="text-gray-700">
                  We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
            >
              ← Back to Home
            </Link>
          </div>
          
          {/* Last Updated */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Last Updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
  )
}


