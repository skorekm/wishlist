import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export const Route = createFileRoute('/terms')({
  component: TermsOfService,
})

function TermsOfService() {
  const TERMS_LAST_UPDATED = new Date('2025-11-15');
  const TERMS_LAST_UPDATED_STRING = TERMS_LAST_UPDATED.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <main className="min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <Card className="border-none shadow-lg p-8">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-3xl font-medium">Terms of Service</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Last updated: {TERMS_LAST_UPDATED_STRING}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Wishlist (the "Service"), you accept and agree to be bound by these Terms 
                of Service ("Terms"). If you do not agree to these Terms, you may not use the Service. We reserve 
                the right to modify these Terms at any time, and continued use of the Service constitutes 
                acceptance of any changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground">
                Wishlist is a web-based application that allows users to create, manage, and share wishlists for 
                various occasions. The Service enables users to add items to wishlists, share wishlists with 
                others via unique links, and allows others to reserve or mark items as purchased.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <h3 className="font-medium text-foreground mb-2">3.1 Account Creation</h3>
                  <p>
                    To use the Service, you must create an account by authenticating through Google OAuth. 
                    You agree to provide accurate, current, and complete information during registration.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-foreground mb-2">3.2 Account Security</h3>
                  <p>
                    You are responsible for maintaining the security of your account. You agree to immediately 
                    notify us of any unauthorized use of your account or any other breach of security.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-2">3.3 Account Termination</h3>
                  <p>
                    You may delete your account at any time. We reserve the right to suspend or terminate your 
                    account if you violate these Terms or engage in conduct that we deem harmful to the Service 
                    or other users.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. User Content and Conduct</h2>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <h3 className="font-medium text-foreground mb-2">4.1 Your Content</h3>
                  <p>
                    You retain ownership of all content you create on the Service (wishlists, items, descriptions, 
                    notes). By using the Service, you grant us a limited license to store, display, and process 
                    your content solely to provide the Service.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-foreground mb-2">4.2 Prohibited Content</h3>
                  <p>You agree not to post content that:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Is illegal, harmful, threatening, abusive, or defamatory</li>
                    <li>Violates intellectual property rights</li>
                    <li>Contains viruses or malicious code</li>
                    <li>Is spam or unsolicited advertising</li>
                    <li>Impersonates another person or entity</li>
                    <li>Violates any applicable laws or regulations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-2">4.3 Prohibited Conduct</h3>
                  <p>You agree not to:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Interfere with or disrupt the Service</li>
                    <li>Attempt to gain unauthorized access to any part of the Service</li>
                    <li>Use the Service for any fraudulent or illegal purpose</li>
                    <li>Harvest or collect information about other users</li>
                    <li>Circumvent any security features of the Service</li>
                    <li>Use automated means to access the Service without permission</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Sharing and Privacy</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  When you share a wishlist using a share link, anyone with that link can view the wishlist and 
                  its items. You are responsible for managing your share links and can revoke access at any time 
                  by regenerating the link.
                </p>
                <p>
                  Your use of the Service is also governed by our Privacy Policy, which is incorporated into 
                  these Terms by reference.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Reservations and Purchases</h2>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <h3 className="font-medium text-foreground mb-2">6.1 Item Reservations</h3>
                  <p>
                    The Service allows users to reserve items on shared wishlists. Reservations are temporary 
                    (default 48 hours or until the event date) and automatically expire if not marked as purchased.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-foreground mb-2">6.2 No Transaction Processing</h3>
                  <p>
                    Wishlist does not process any financial transactions. We do not handle payments, purchases, 
                    or shipping. The Service is solely for organizing and coordinating gift-giving. Any actual 
                    purchases are conducted outside of our Service.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-2">6.3 Accuracy of Information</h3>
                  <p>
                    We are not responsible for the accuracy of item information (prices, links, availability) 
                    added by users. Users should verify all information with merchants before making purchases.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  The Service and its original content (excluding user content), features, and functionality are 
                  owned by Wishlist and are protected by international copyright, trademark, patent, trade secret, 
                  and other intellectual property laws.
                </p>
                <p>
                  You may not copy, modify, distribute, sell, or lease any part of our Service without our explicit 
                  written permission.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Third-Party Services</h2>
              <p className="text-muted-foreground">
                The Service may contain links to third-party websites or services (such as product pages on 
                e-commerce sites). We are not responsible for the content, privacy policies, or practices of 
                third-party websites. You acknowledge and agree that we shall not be liable for any damage or 
                loss caused by or in connection with use of third-party content or services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Disclaimer of Warranties</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER 
                  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR 
                  A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
                </p>
                <p>
                  We do not warrant that:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>The Service will be uninterrupted or error-free</li>
                  <li>Defects will be corrected</li>
                  <li>The Service is free of viruses or harmful components</li>
                  <li>Results obtained from the Service will be accurate or reliable</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Limitation of Liability</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, WISHLIST AND ITS AFFILIATES, OFFICERS, DIRECTORS, 
                  EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, 
                  OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL 
                  ARISING FROM:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Your use or inability to use the Service</li>
                  <li>Unauthorized access to or alteration of your content</li>
                  <li>Any conduct or content of third parties on the Service</li>
                  <li>Any content obtained from the Service</li>
                </ul>
                <p className="mt-3">
                  In no event shall our total liability exceed the amount you paid us in the past twelve months, 
                  or $100, whichever is greater.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to indemnify, defend, and hold harmless Wishlist and its affiliates, officers, directors, 
                employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal 
                fees) arising from: (a) your use of the Service; (b) your violation of these Terms; (c) your 
                violation of any rights of another party; or (d) your content.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Dispute Resolution</h2>
              <div className="space-y-3 text-muted-foreground">
                <div>
                  <h3 className="font-medium text-foreground mb-2">12.1 Informal Resolution</h3>
                  <p>
                    If you have a dispute with us, you agree to first contact us at{' '}
                    <a href="mailto:support@wishlist.com" className="text-primary hover:underline">support@wishlist.com</a>{' '}
                    and attempt to resolve the dispute informally.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-foreground mb-2">12.2 Governing Law</h3>
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of Poland, 
                    without regard to its conflict of law provisions.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-foreground mb-2">12.3 Arbitration</h3>
                  <p>
                    Any disputes not resolved informally shall be resolved through binding arbitration in accordance 
                    with the rules of the applicable arbitration association.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Changes to the Service</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any 
                time with or without notice. We shall not be liable to you or any third party for any modification, 
                suspension, or discontinuation of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">14. Severability</h2>
              <p className="text-muted-foreground">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be 
                limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain 
                in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">15. Entire Agreement</h2>
              <p className="text-muted-foreground">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and 
                Wishlist regarding the Service and supersede all prior agreements and understandings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">16. Contact Information</h2>
              <div className="text-muted-foreground space-y-2">
                <p>If you have questions about these Terms, please contact us:</p>
                <ul className="list-none space-y-1">
                  <li><strong>Service Provider:</strong> Marcin Skorek</li>
                  <li><strong>Email:</strong> <a href="mailto:legal@wishlist.com" className="text-primary hover:underline">legal@wishlist.com</a></li>
                  <li><strong>Support:</strong> <a href="mailto:support@wishlist.com" className="text-primary hover:underline">support@wishlist.com</a></li>
                  <li><strong>Address:</strong> Available upon request via support@wishlist.com</li>
                </ul>
              </div>
            </section>

            <div className="pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                These terms of service are provided as a template and should be reviewed by legal counsel to ensure 
                compliance with applicable laws and regulations in your jurisdiction. You should customize these 
                terms based on your specific business model and location.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

