import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';
import { Container } from '@/components/shared/container';
import Link from 'next/link';
import {
  Shield,
  Eye,
  Database,
  Share2,
  Settings,
  Mail,
  Globe,
  Lock,
  Users,
  FileText,
} from 'lucide-react';

export default function PrivacyPage() {
  const lastUpdated = 'November 30, 2025';

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 md:pt-32 md:pb-24">
        <Container>
          {/* Header */}
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center md:mb-16">
              <div className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                <Shield className="h-4 w-4" />
                Privacy First
              </div>
              <h1 className="mb-6">Privacy Policy</h1>
              <p className="text-muted-foreground text-lg md:text-xl">
                At walkthru.earth, we believe privacy is a fundamental right.
                This policy explains how we collect, use, and protect your
                information across our platforms.
              </p>
              <p className="text-muted-foreground mt-4 text-sm">
                Last updated: {lastUpdated}
              </p>
            </div>

            {/* Table of Contents */}
            <nav className="bg-muted/50 mb-12 rounded-xl p-6 md:mb-16 md:p-8">
              <h2 className="mb-4 text-xl font-semibold">Contents</h2>
              <ul className="grid gap-2 text-sm md:grid-cols-2 md:gap-3">
                {[
                  { href: '#overview', label: 'Overview' },
                  { href: '#what-we-collect', label: 'What We Collect' },
                  { href: '#how-we-use', label: 'How We Use Information' },
                  { href: '#cookies', label: 'Cookies & Analytics' },
                  { href: '#sharing', label: 'Information Sharing' },
                  { href: '#open-data', label: 'Open Data Principles' },
                  { href: '#your-rights', label: 'Your Rights' },
                  { href: '#security', label: 'Data Security' },
                  { href: '#children', label: "Children's Privacy" },
                  { href: '#changes', label: 'Policy Changes' },
                  { href: '#contact', label: 'Contact Us' },
                ].map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Content Sections */}
            <div className="prose-lg space-y-12 md:space-y-16">
              {/* Overview */}
              <section id="overview">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-lg p-2">
                    <Eye className="h-5 w-5" />
                  </div>
                  <h2 className="m-0">Overview</h2>
                </div>
                <p className="text-muted-foreground">
                  This Privacy Policy applies to walkthru.earth and its
                  associated platforms, including{' '}
                  <Link
                    href="/opensensor"
                    className="text-primary hover:underline"
                  >
                    opensensor.space
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/hormones-cities"
                    className="text-primary hover:underline"
                  >
                    Hormones & Cities
                  </Link>
                  . We are committed to transparency and prioritize your privacy
                  in everything we do.
                </p>
                <p className="text-muted-foreground">
                  Our mission is to detect hidden patterns of daily life and
                  turn them into people-first solutions that support wellbeing
                  in cities. We achieve this while maintaining the highest
                  standards of data protection and ethical data practices.
                </p>
              </section>

              {/* What We Collect */}
              <section id="what-we-collect">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-lg p-2">
                    <Database className="h-5 w-5" />
                  </div>
                  <h2 className="m-0">What We Collect</h2>
                </div>

                <h3 className="mt-6 text-lg font-semibold">
                  Website Analytics (Cookieless by Default)
                </h3>
                <p className="text-muted-foreground">
                  We use a cookieless-first approach to analytics. Before you
                  consent to cookies, we collect only anonymous, aggregated data
                  that cannot identify you personally:
                </p>
                <ul className="text-muted-foreground list-disc space-y-1 pl-6">
                  <li>Page views and navigation patterns</li>
                  <li>General geographic region (country level)</li>
                  <li>Device type and browser information</li>
                  <li>Referral sources</li>
                </ul>

                <h3 className="mt-6 text-lg font-semibold">
                  With Your Consent (Cookies Accepted)
                </h3>
                <p className="text-muted-foreground">
                  If you accept analytics cookies, we may collect additional
                  information to improve our services:
                </p>
                <ul className="text-muted-foreground list-disc space-y-1 pl-6">
                  <li>Session duration and engagement metrics</li>
                  <li>Feature usage patterns</li>
                  <li>Returning visitor recognition</li>
                </ul>

                <h3 className="mt-6 text-lg font-semibold">
                  OpenSensor.Space (IoT Sensor Data)
                </h3>
                <p className="text-muted-foreground">
                  Our IoT sensor network collects environmental data only:
                </p>
                <ul className="text-muted-foreground list-disc space-y-1 pl-6">
                  <li>Temperature, humidity, and air quality measurements</li>
                  <li>Atmospheric pressure and weather conditions</li>
                  <li>
                    Sensor location (geographic coordinates of the device)
                  </li>
                  <li>Timestamp of measurements</li>
                </ul>
                <p className="text-muted-foreground">
                  This data is environmental in nature and does not include any
                  personal information. Sensor operators voluntarily contribute
                  their data to our open network.
                </p>

                <h3 className="mt-6 text-lg font-semibold">
                  Hormones & Cities Survey
                </h3>
                <p className="text-muted-foreground">
                  Our urban wellbeing survey is designed with privacy at its
                  core:
                </p>
                <ul className="text-muted-foreground list-disc space-y-1 pl-6">
                  <li>All responses are completely anonymous</li>
                  <li>
                    No email addresses or personal identifiers are collected
                  </li>
                  <li>
                    Location data is aggregated to neighborhood level only
                  </li>
                  <li>
                    Responses cannot be traced back to individual participants
                  </li>
                </ul>

                <h3 className="mt-6 text-lg font-semibold">
                  Voluntary Communications
                </h3>
                <p className="text-muted-foreground">
                  When you contact us directly via email or other means, we
                  collect:
                </p>
                <ul className="text-muted-foreground list-disc space-y-1 pl-6">
                  <li>Name and email address</li>
                  <li>Message content</li>
                  <li>Any other information you choose to provide</li>
                </ul>
              </section>

              {/* How We Use Information */}
              <section id="how-we-use">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-lg p-2">
                    <Settings className="h-5 w-5" />
                  </div>
                  <h2 className="m-0">How We Use Information</h2>
                </div>
                <p className="text-muted-foreground">
                  We use collected information to:
                </p>
                <ul className="text-muted-foreground list-disc space-y-2 pl-6">
                  <li>
                    <strong>Improve our platforms:</strong> Understand how users
                    interact with our websites and identify areas for
                    improvement
                  </li>
                  <li>
                    <strong>Advance urban research:</strong> Analyze aggregated
                    environmental and survey data to identify patterns that
                    affect urban wellbeing
                  </li>
                  <li>
                    <strong>Provide open data:</strong> Share anonymized
                    environmental data with researchers, policymakers, and the
                    public
                  </li>
                  <li>
                    <strong>Respond to inquiries:</strong> Answer your questions
                    and provide support
                  </li>
                  <li>
                    <strong>Ensure security:</strong> Protect our platforms from
                    abuse and maintain system integrity
                  </li>
                </ul>
              </section>

              {/* Cookies & Analytics */}
              <section id="cookies">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-lg p-2">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h2 className="m-0">Cookies & Analytics</h2>
                </div>

                <h3 className="mt-6 text-lg font-semibold">Our Approach</h3>
                <p className="text-muted-foreground">
                  We take a privacy-first approach to analytics. By default, we
                  operate in cookieless mode, which means:
                </p>
                <ul className="text-muted-foreground list-disc space-y-1 pl-6">
                  <li>No cookies are set until you give consent</li>
                  <li>
                    Anonymous tracking provides basic insights without
                    identifying you
                  </li>
                  <li>Your choice is remembered and respected</li>
                </ul>

                <h3 className="mt-6 text-lg font-semibold">
                  Types of Cookies We Use
                </h3>
                <div className="mt-4 space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-semibold">Essential Cookies</h4>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Required for basic website functionality. These cannot be
                      disabled and do not track personal information.
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-semibold">Analytics Cookies</h4>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Help us understand visitor interactions through PostHog
                      and Google Analytics. Only active with your consent.
                    </p>
                  </div>
                </div>

                <h3 className="mt-6 text-lg font-semibold">Managing Cookies</h3>
                <p className="text-muted-foreground">
                  You can manage your cookie preferences at any time through the
                  cookie banner on our website. You can also control cookies
                  through your browser settings.
                </p>
              </section>

              {/* Information Sharing */}
              <section id="sharing">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-lg p-2">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <h2 className="m-0">Information Sharing</h2>
                </div>
                <p className="text-muted-foreground">
                  We do not sell your personal information. We may share
                  information in the following circumstances:
                </p>
                <ul className="text-muted-foreground list-disc space-y-2 pl-6">
                  <li>
                    <strong>Service providers:</strong> We use trusted third
                    parties for analytics (PostHog, Google Analytics) and
                    infrastructure services
                  </li>
                  <li>
                    <strong>Open data initiatives:</strong> Environmental sensor
                    data is shared publicly through{' '}
                    <a
                      href="https://source.coop/walkthru-earth"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Source Cooperative
                    </a>{' '}
                    in anonymized, aggregated formats
                  </li>
                  <li>
                    <strong>Legal requirements:</strong> When required by law or
                    to protect our rights and safety
                  </li>
                  <li>
                    <strong>Research collaborations:</strong> Anonymized,
                    aggregated data may be shared with academic and research
                    partners
                  </li>
                </ul>
              </section>

              {/* Open Data Principles */}
              <section id="open-data">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-lg p-2">
                    <Globe className="h-5 w-5" />
                  </div>
                  <h2 className="m-0">Open Data Principles</h2>
                </div>
                <p className="text-muted-foreground">
                  We believe in the power of open data to improve urban life.
                  Our commitment includes:
                </p>
                <ul className="text-muted-foreground list-disc space-y-2 pl-6">
                  <li>
                    <strong>Transparency:</strong> Environmental data from
                    OpenSensor.Space is publicly available in open Parquet
                    format
                  </li>
                  <li>
                    <strong>Anonymization:</strong> All shared data is
                    thoroughly anonymized to prevent identification of
                    individuals
                  </li>
                  <li>
                    <strong>Community benefit:</strong> Data is shared to
                    support research, urban planning, and community
                    decision-making
                  </li>
                  <li>
                    <strong>Ethical use:</strong> We encourage responsible use
                    of our open data for positive social impact
                  </li>
                </ul>
              </section>

              {/* Your Rights */}
              <section id="your-rights">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-lg p-2">
                    <Users className="h-5 w-5" />
                  </div>
                  <h2 className="m-0">Your Rights</h2>
                </div>
                <p className="text-muted-foreground">
                  Depending on your location, you may have the following rights
                  regarding your personal information:
                </p>
                <ul className="text-muted-foreground list-disc space-y-2 pl-6">
                  <li>
                    <strong>Access:</strong> Request a copy of the personal
                    information we hold about you
                  </li>
                  <li>
                    <strong>Correction:</strong> Request correction of
                    inaccurate personal information
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your personal
                    information
                  </li>
                  <li>
                    <strong>Portability:</strong> Request transfer of your data
                    in a machine-readable format
                  </li>
                  <li>
                    <strong>Opt-out:</strong> Withdraw consent for analytics
                    tracking at any time
                  </li>
                  <li>
                    <strong>Objection:</strong> Object to processing of your
                    personal information
                  </li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  To exercise these rights, please contact us at{' '}
                  <a
                    href="mailto:hi@walkthru.earth"
                    className="text-primary hover:underline"
                  >
                    hi@walkthru.earth
                  </a>
                  .
                </p>
              </section>

              {/* Data Security */}
              <section id="security">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-lg p-2">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h2 className="m-0">Data Security</h2>
                </div>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational measures
                  to protect your information:
                </p>
                <ul className="text-muted-foreground list-disc space-y-1 pl-6">
                  <li>HTTPS encryption for all data transmission</li>
                  <li>Secure cloud infrastructure with access controls</li>
                  <li>Regular security assessments and updates</li>
                  <li>Minimal data collection practices</li>
                  <li>Data anonymization where possible</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  While we strive to protect your information, no method of
                  transmission over the Internet is 100% secure. We cannot
                  guarantee absolute security but are committed to implementing
                  industry best practices.
                </p>
              </section>

              {/* Children's Privacy */}
              <section id="children">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-lg p-2">
                    <Shield className="h-5 w-5" />
                  </div>
                  <h2 className="m-0">Children&apos;s Privacy</h2>
                </div>
                <p className="text-muted-foreground">
                  Our platforms are not directed at children under 13 years of
                  age. We do not knowingly collect personal information from
                  children. If you believe we have inadvertently collected
                  information from a child, please contact us immediately.
                </p>
              </section>

              {/* Policy Changes */}
              <section id="changes">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-lg p-2">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h2 className="m-0">Policy Changes</h2>
                </div>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any material changes by posting the new Privacy
                  Policy on this page and updating the &ldquo;Last
                  updated&rdquo; date. We encourage you to review this Privacy
                  Policy periodically.
                </p>
                <p className="text-muted-foreground mt-4">
                  Continued use of our platforms after any changes constitutes
                  acceptance of the updated Privacy Policy.
                </p>
              </section>

              {/* Contact Us */}
              <section id="contact">
                <div className="mb-4 flex items-center gap-3">
                  <div className="bg-primary/10 text-primary rounded-lg p-2">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h2 className="m-0">Contact Us</h2>
                </div>
                <p className="text-muted-foreground">
                  If you have any questions, concerns, or requests regarding
                  this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-muted/30 mt-4 rounded-lg p-6">
                  <p className="font-semibold">walkthru.earth</p>
                  <p className="text-muted-foreground mt-2">
                    Email:{' '}
                    <a
                      href="mailto:hi@walkthru.earth"
                      className="text-primary hover:underline"
                    >
                      hi@walkthru.earth
                    </a>
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Website:{' '}
                    <a
                      href="https://walkthru.earth"
                      className="text-primary hover:underline"
                    >
                      walkthru.earth
                    </a>
                  </p>
                </div>
                <p className="text-muted-foreground mt-4">
                  We aim to respond to all inquiries within 30 days.
                </p>
              </section>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
