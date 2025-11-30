import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

const Privacy = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        <section className="relative py-24 bg-primary text-primary-foreground">
          <div className="container px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                Privacy Policy
              </h1>
              <p className="text-xl text-primary-foreground/80">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-background">
          <div className="container px-6">
            <div className="max-w-4xl mx-auto prose prose-lg">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-8 text-foreground/80"
              >
                <div>
                  <p className="text-lg mb-6">
                    At Uncle Mays Produce, we are committed to protecting your privacy. This Privacy Policy explains 
                    how we collect, use, disclose, and safeguard your information when you visit our website and use 
                    our subscription service. Please read this privacy policy carefully. If you do not agree with the 
                    terms of this privacy policy, please do not access the site or use our services.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">1. Information We Collect</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
                      <p>
                        We collect information that you provide directly to us when you:
                      </p>
                      <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                        <li>Create an account or subscribe to our service</li>
                        <li>Place an order or make a purchase</li>
                        <li>Contact us for customer support</li>
                        <li>Subscribe to our newsletter or marketing communications</li>
                        <li>Participate in surveys or promotions</li>
                      </ul>
                      <p className="mt-3">
                        This information may include your name, email address, postal address, phone number, payment 
                        information (credit card numbers, billing address), and any other information you choose to provide.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Automatically Collected Information</h3>
                      <p>
                        When you visit our website, we automatically collect certain information about your device, including:
                      </p>
                      <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
                        <li>IP address</li>
                        <li>Browser type and version</li>
                        <li>Operating system</li>
                        <li>Pages you visit and time spent on pages</li>
                        <li>Referring website addresses</li>
                        <li>Cookies and similar tracking technologies</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">2. How We Use Your Information</h2>
                  <p className="mb-3">We use the information we collect for various purposes, including:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>Processing and fulfilling your orders and subscriptions</li>
                    <li>Managing your account and subscription preferences</li>
                    <li>Communicating with you about your orders, deliveries, and account status</li>
                    <li>Sending you marketing communications (with your consent)</li>
                    <li>Responding to your inquiries and providing customer support</li>
                    <li>Improving our website, products, and services</li>
                    <li>Detecting, preventing, and addressing technical issues and fraud</li>
                    <li>Complying with legal obligations and enforcing our terms</li>
                    <li>Conducting analytics and research to better understand our customers</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">3. Information Sharing and Disclosure</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Service Providers</h3>
                      <p>
                        We may share your information with third-party service providers who perform services on our behalf, 
                        such as payment processing, order fulfillment, shipping and delivery, email marketing, and website 
                        analytics. These service providers are contractually obligated to protect your information and use 
                        it only for the purposes we specify.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Business Transfers</h3>
                      <p>
                        If we are involved in a merger, acquisition, or sale of assets, your information may be transferred 
                        as part of that transaction. We will notify you of any such change in ownership or control of your 
                        personal information.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Legal Requirements</h3>
                      <p>
                        We may disclose your information if required to do so by law or in response to valid requests by 
                        public authorities (e.g., a court or a government agency).
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">We Do Not Sell Your Information</h3>
                      <p>
                        We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">4. Cookies and Tracking Technologies</h2>
                  <p>
                    We use cookies and similar tracking technologies to track activity on our website and hold certain 
                    information. Cookies are files with a small amount of data which may include an anonymous unique identifier. 
                    You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, 
                    if you do not accept cookies, you may not be able to use some portions of our website.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">5. Data Security</h2>
                  <p>
                    We implement appropriate technical and organizational security measures to protect your personal information 
                    against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over 
                    the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">6. Your Privacy Rights</h2>
                  <p className="mb-3">Depending on your location, you may have certain rights regarding your personal information, including:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li><strong>Access:</strong> Request access to your personal information</li>
                    <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                    <li><strong>Opt-Out:</strong> Opt-out of marketing communications at any time</li>
                    <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                    <li><strong>Objection:</strong> Object to certain processing of your information</li>
                  </ul>
                  <p className="mt-3">
                    To exercise these rights, please contact us at{" "}
                    <a href="mailto:info@unclemays.com" className="text-primary hover:underline">
                      info@unclemays.com
                    </a>
                    . We will respond to your request within a reasonable timeframe.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">7. Children's Privacy</h2>
                  <p>
                    Our service is not intended for children under the age of 13. We do not knowingly collect personal 
                    information from children under 13. If you are a parent or guardian and believe your child has provided 
                    us with personal information, please contact us immediately.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">8. Changes to This Privacy Policy</h2>
                  <p>
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
                    Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy 
                    Policy periodically for any changes.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">9. Contact Us</h2>
                  <p>
                    If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                  </p>
                  <div className="mt-4 space-y-2">
                    <p>
                      <strong>Email:</strong>{" "}
                      <a href="mailto:info@unclemays.com" className="text-primary hover:underline">
                        info@unclemays.com
                      </a>
                    </p>
                    <p>
                      <strong>Phone:</strong>{" "}
                      <a href="tel:+13129722595" className="text-primary hover:underline">
                        (312) 972-2595
                      </a>
                    </p>
                    <p>
                      <strong>Address:</strong> 73 W Monroe Ave #3002, Chicago, IL 60603
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Privacy;

