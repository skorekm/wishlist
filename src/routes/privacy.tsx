import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Shield } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { CookieSettingsDialog } from '@/components/modules/CookieConsent/CookieSettingsDialog'
import { useCookieConsent } from '@/hooks/useCookieConsent'
import { useState } from 'react'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPolicy,
})

function PrivacyPolicy() {
  const PRIVACY_POLICY_LAST_UPDATED = new Date('2025-11-15');
  const PRIVACY_POLICY_LAST_UPDATED_STRING = PRIVACY_POLICY_LAST_UPDATED.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const [showCookieSettings, setShowCookieSettings] = useState(false)
  const { saveConsent } = useCookieConsent()
  
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
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-3xl font-medium">Privacy Policy</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              Last updated: {PRIVACY_POLICY_LAST_UPDATED_STRING}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground">
                Welcome to Wishlist ("we," "our," or "us"). We are committed to protecting your personal information 
                and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
                your information when you use our wishlist management application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="font-medium text-foreground mb-2">2.1 Information You Provide</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Account information (name, email address) via Google OAuth</li>
                    <li>Wishlist data (names, descriptions, event dates)</li>
                    <li>Wishlist items (names, prices, links, notes, categories)</li>
                    <li>Reservation information (name and email when reserving items)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-foreground mb-2">2.2 Automatically Collected Information</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Usage data (features used, interactions with the application)</li>
                    <li>Device information (browser type, operating system)</li>
                    <li>Log data (IP address, access times, pages viewed)</li>
                    <li>Cookies and similar technologies for theme preferences</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>To provide and maintain our service</li>
                <li>To authenticate your account via Google OAuth</li>
                <li>To send reservation confirmations and reminders via email</li>
                <li>To manage and display your wishlists and items</li>
                <li>To facilitate sharing of wishlists with others</li>
                <li>To improve and optimize our application</li>
                <li>To respond to your inquiries and provide customer support</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Information Sharing and Disclosure</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>With Your Consent:</strong> When you share wishlists via share links</li>
                  <li><strong>Service Providers:</strong> Supabase (database and authentication), email service providers</li>
                  <li><strong>Google:</strong> For OAuth authentication (subject to Google's Privacy Policy)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, sale, or acquisition</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined 
                in this Privacy Policy, unless a longer retention period is required or permitted by law. When you 
                delete your account, we will delete or anonymize your personal information within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Your Data Protection Rights (GDPR)</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>If you are a resident of the European Economic Area (EEA), you have the following rights:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Right to Access:</strong> Request copies of your personal data</li>
                  <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
                  <li><strong>Right to Erasure:</strong> Request deletion of your personal data</li>
                  <li><strong>Right to Restrict Processing:</strong> Request restriction of processing your data</li>
                  <li><strong>Right to Data Portability:</strong> Request transfer of your data</li>
                  <li><strong>Right to Object:</strong> Object to our processing of your data</li>
                  <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, please contact us at <a href="mailto:privacy@wishlist.com" className="text-primary hover:underline">privacy@wishlist.com</a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. California Privacy Rights (CCPA)</h2>
              <div className="space-y-2 text-muted-foreground">
                <p>If you are a California resident, you have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Know what personal information we collect, use, and disclose</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt-out of the sale of personal information (we do not sell your data)</li>
                  <li>Non-discrimination for exercising your privacy rights</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Cookies and Tracking Technologies</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  We use cookies and similar tracking technologies to track activity on our application and store 
                  certain information. We use cookies for authentication, theme preferences, and to improve user 
                  experience.
                </p>
                <p>
                  You can manage your cookie preferences at any time through our cookie settings. 
                  Click the button below to customize which cookies you allow:
                </p>
                <div className="pt-2">
                  <Button 
                    variant="link" 
                    className="h-auto p-0 text-primary hover:underline"
                    onClick={() => setShowCookieSettings(true)}
                  >
                    Manage Cookie Preferences
                  </Button>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational security measures to protect your personal 
                information. However, no method of transmission over the internet or electronic storage is 100% 
                secure. We use Supabase's security features including row-level security policies and encrypted 
                connections.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our service is not intended for users under the age of 13. We do not knowingly collect personal 
                information from children under 13. If you are a parent or guardian and believe your child has 
                provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your information may be transferred to and maintained on servers located outside of your state, 
                province, country, or other governmental jurisdiction where data protection laws may differ. 
                We ensure appropriate safeguards are in place for such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
                the new Privacy Policy on this page and updating the "Last updated" date. Continued use of our 
                service after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
              <div className="text-muted-foreground space-y-2">
                <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
                <ul className="list-none space-y-1">
                  <li><strong>Data Controller:</strong> Marcin Skorek</li>
                  <li><strong>Email:</strong> <a href="mailto:privacy@wishlist.com" className="text-primary hover:underline">privacy@wishlist.com</a></li>
                  <li><strong>Support:</strong> <a href="mailto:support@wishlist.com" className="text-primary hover:underline">support@wishlist.com</a></li>
                  <li><strong>Address:</strong> Available upon request via support@wishlist.com</li>
                </ul>
              </div>
            </section>

            <div className="pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                This privacy policy is provided as a template and should be reviewed by legal counsel to ensure 
                compliance with applicable laws and regulations in your jurisdiction.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <CookieSettingsDialog
        open={showCookieSettings}
        onOpenChange={setShowCookieSettings}
        onSave={saveConsent}
      />
    </main>
  )
}

