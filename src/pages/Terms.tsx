import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

const Terms = () => {
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
                Terms of Service
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
                    These Terms of Service ("Terms") govern your access to and use of Uncle Mays Produce's website and 
                    subscription service. By accessing or using our service, you agree to be bound by these Terms. If you 
                    disagree with any part of these terms, then you may not access the service.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">1. Acceptance of Terms</h2>
                  <p>
                    By creating an account, placing an order, or subscribing to our service, you acknowledge that you have 
                    read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to 
                    these Terms, you may not use our service.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">2. Subscription Service</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Subscription Plans</h3>
                      <p>
                        We offer various subscription plans with different delivery frequencies and box sizes. By subscribing, 
                        you agree to receive regular deliveries of produce boxes according to your selected plan.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Automatic Renewal</h3>
                      <p>
                        Your subscription will automatically renew at the end of each billing cycle unless you cancel it before 
                        the renewal date. You will be charged the subscription fee for the upcoming period on your renewal date.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Modification of Service</h3>
                      <p>
                        We reserve the right to modify, suspend, or discontinue any part of our service at any time, with or 
                        without notice. We will not be liable to you or any third party for any modification, suspension, or 
                        discontinuance of the service.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">3. Payment Terms</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Payment Processing</h3>
                      <p>
                        Payment is processed automatically on your subscription renewal date using the payment method you have 
                        on file. You are responsible for ensuring that your payment information is current and valid.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Accepted Payment Methods</h3>
                      <p>
                        We accept major credit cards and debit cards. All prices are in USD and include applicable taxes unless 
                        otherwise stated.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Failed Payments</h3>
                      <p>
                        If a payment fails, we will attempt to process it again. If payment continues to fail, we may suspend 
                        or cancel your subscription. You will be notified of any payment issues via email.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Refunds</h3>
                      <p>
                        Refunds are handled on a case-by-case basis. If you are unsatisfied with your order, please contact us 
                        within 48 hours of delivery for assistance.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">4. Cancellation Policy</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Cancellation by You</h3>
                      <p>
                        You may cancel your subscription at any time through your account settings or by contacting us. 
                        Cancellations must be made at least 48 hours before your next scheduled delivery to avoid being 
                        charged for that delivery. Once cancelled, you will continue to receive deliveries until the end of 
                        your current billing period.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Cancellation by Us</h3>
                      <p>
                        We reserve the right to cancel or suspend your subscription at any time for violations of these Terms, 
                        fraudulent activity, or any other reason we deem necessary.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">5. Product Quality and Guarantee</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Quality Standards</h3>
                      <p>
                        We are committed to providing fresh, high-quality produce. We work directly with Black farmers to ensure 
                        the best quality products. However, as produce is a natural product, there may be variations in size, 
                        color, and appearance.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Quality Issues</h3>
                      <p>
                        If you receive items that don't meet our quality standards, please contact us within 48 hours of delivery. 
                        We will work with you to provide a replacement, credit, or refund as appropriate.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Product Substitutions</h3>
                      <p>
                        Due to seasonal availability and supply variations, we reserve the right to substitute items in your box 
                        with similar products of equal or greater value. We will do our best to notify you of any significant 
                        substitutions.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">6. Delivery Terms</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Delivery Schedule</h3>
                      <p>
                        Deliveries are made according to your selected subscription plan. We will provide estimated delivery 
                        dates, but actual delivery times may vary due to weather, shipping delays, or other factors beyond our 
                        control.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Delivery Address</h3>
                      <p>
                        You are responsible for providing an accurate delivery address. If a delivery fails due to an incorrect 
                        address, you may be charged for a replacement delivery.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Missed Deliveries</h3>
                      <p>
                        If you are not available to receive a delivery, we will attempt to leave it in a safe location or 
                        arrange for redelivery. You are responsible for any loss or damage to products left unattended.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">7. User Accounts</h2>
                  <p>
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities 
                    that occur under your account. You agree to notify us immediately of any unauthorized use of your account. 
                    We are not liable for any loss or damage arising from your failure to protect your account information.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">8. Prohibited Uses</h2>
                  <p className="mb-3">You agree not to use our service:</p>
                  <ul className="list-disc list-inside ml-4 space-y-2">
                    <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                    <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                    <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                    <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                    <li>To submit false or misleading information</li>
                    <li>To upload or transmit viruses or any other type of malicious code</li>
                    <li>To collect or track the personal information of others</li>
                    <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                    <li>For any obscene or immoral purpose</li>
                    <li>To interfere with or circumvent the security features of the service</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">9. Intellectual Property</h2>
                  <p>
                    The service and its original content, features, and functionality are owned by Uncle Mays Produce and are 
                    protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. 
                    You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any of our 
                    content without our express written permission.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">10. Limitation of Liability</h2>
                  <p>
                    To the fullest extent permitted by applicable law, Uncle Mays Produce shall not be liable for any indirect, 
                    incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
                    directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your 
                    use of the service.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">11. Indemnification</h2>
                  <p>
                    You agree to defend, indemnify, and hold harmless Uncle Mays Produce and its officers, directors, employees, 
                    and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable 
                    attorney's fees, arising out of or in any way connected with your use of the service or violation of these Terms.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">12. Dispute Resolution</h2>
                  <p>
                    Any disputes arising out of or relating to these Terms or the service shall be resolved through binding 
                    arbitration in accordance with the rules of the American Arbitration Association, except where prohibited by law.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">13. Changes to Terms</h2>
                  <p>
                    We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide 
                    at least 30 days notice prior to any new terms taking effect. Your continued use of the service after any 
                    changes constitutes acceptance of the new Terms.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">14. Governing Law</h2>
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of the State of Illinois, United 
                    States, without regard to its conflict of law provisions.
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-4">15. Contact Us</h2>
                  <p>
                    If you have any questions about these Terms of Service, please contact us:
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

export default Terms;

