'use client';

import { Localized } from '@/lib/i18n/i18n-provider';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/sections/footer';
import { Container } from '@/components/shared/container';
import {
  BrandEyebrow,
  BrandHero,
  BrandIcon,
  BrandPage,
  BrandPanel,
} from '@/components/shared/brand-ui';
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
    <Localized>
      <Navbar />
      <BrandPage className="pb-16 md:pb-24">
        <BrandHero tone="blue" className="pt-28 pb-16 md:pt-36 md:pb-20">
          <Container>
            {/* Header */}
            <div className="mx-auto max-w-4xl text-center">
              <BrandEyebrow>
                <Shield className="h-4 w-4" />
                Privacy First
              </BrandEyebrow>
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
          </Container>
        </BrandHero>

        <Container className="pt-12 md:pt-16">
          <div className="mx-auto max-w-4xl">
            {/* Table of Contents */}
            <nav className="mb-12 md:mb-16">
              <BrandPanel tone="amber">
                <h2 className="mb-5 text-2xl md:text-3xl">Contents</h2>
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
                        className="focus-visible:ring-ring inline-block rounded-lg px-2 py-1 font-bold underline-offset-4 hover:underline focus-visible:ring-2"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </BrandPanel>
            </nav>

            {/* Content Sections */}
            <div className="prose-lg space-y-6 md:space-y-8">
              {/* Overview */}
              <section id="overview" className="brand-panel scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <BrandIcon className="h-11 w-11">
                    <Eye className="h-5 w-5" />
                  </BrandIcon>
                  <h2 className="m-0 text-2xl md:text-3xl">Overview</h2>
                </div>
                <p className="text-muted-foreground">
                  This Privacy Policy applies to walkthru.earth and its
                  associated platforms, including{' '}
                  <Link
                    href="/opensensor"
                    className="text-foreground underline underline-offset-4"
                  >
                    opensensor.space
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/hormones-cities"
                    className="text-foreground underline underline-offset-4"
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
              <section
                id="what-we-collect"
                className="brand-panel scroll-mt-24"
              >
                <div className="mb-4 flex items-center gap-3">
                  <BrandIcon className="h-11 w-11">
                    <Database className="h-5 w-5" />
                  </BrandIcon>
                  <h2 className="m-0 text-2xl md:text-3xl">What We Collect</h2>
                </div>

                <h3 className="mt-6 text-lg font-semibold">
                  Website Analytics (Cookieless by Default)
                </h3>
                <p className="text-muted-foreground">
                  We use a cookieless-first approach to analytics. Before you
                  consent to cookies, we collect only anonymous, aggregated data
                  that cannot identify you personally:
                </p>
                <ul className="text-muted-foreground list-disc space-y-1 ps-6">
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
                <ul className="text-muted-foreground list-disc space-y-1 ps-6">
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
                <ul className="text-muted-foreground list-disc space-y-1 ps-6">
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
                <ul className="text-muted-foreground list-disc space-y-1 ps-6">
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
                <ul className="text-muted-foreground list-disc space-y-1 ps-6">
                  <li>Name and email address</li>
                  <li>Message content</li>
                  <li>Any other information you choose to provide</li>
                </ul>
              </section>

              {/* How We Use Information */}
              <section id="how-we-use" className="brand-panel scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <BrandIcon className="h-11 w-11">
                    <Settings className="h-5 w-5" />
                  </BrandIcon>
                  <h2 className="m-0 text-2xl md:text-3xl">
                    How We Use Information
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  We use collected information to:
                </p>
                <ul className="text-muted-foreground list-disc space-y-2 ps-6">
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
              <section id="cookies" className="brand-panel scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <BrandIcon className="h-11 w-11">
                    <FileText className="h-5 w-5" />
                  </BrandIcon>
                  <h2 className="m-0 text-2xl md:text-3xl">
                    Cookies & Analytics
                  </h2>
                </div>

                <h3 className="mt-6 text-lg font-semibold">Our Approach</h3>
                <p className="text-muted-foreground">
                  We take a privacy-first approach to analytics. By default, we
                  operate in cookieless mode, which means:
                </p>
                <ul className="text-muted-foreground list-disc space-y-1 ps-6">
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
                  <div className="bg-muted rounded-2xl border-2 p-5">
                    <h4 className="font-semibold">Essential Cookies</h4>
                    <p className="text-muted-foreground mt-1 text-base">
                      Required for basic website functionality. These cannot be
                      disabled and do not track personal information.
                    </p>
                  </div>
                  <div className="bg-muted rounded-2xl border-2 p-5">
                    <h4 className="font-semibold">Analytics Cookies</h4>
                    <p className="text-muted-foreground mt-1 text-base">
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
              <section id="sharing" className="brand-panel scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <BrandIcon className="h-11 w-11">
                    <Share2 className="h-5 w-5" />
                  </BrandIcon>
                  <h2 className="m-0 text-2xl md:text-3xl">
                    Information Sharing
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  We do not sell your personal information. We may share
                  information in the following circumstances:
                </p>
                <ul className="text-muted-foreground list-disc space-y-2 ps-6">
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
                      className="text-foreground underline underline-offset-4"
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
              <section id="open-data" className="brand-panel scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <BrandIcon className="h-11 w-11">
                    <Globe className="h-5 w-5" />
                  </BrandIcon>
                  <h2 className="m-0 text-2xl md:text-3xl">
                    Open Data Principles
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  We believe in the power of open data to improve urban life.
                  Our commitment includes:
                </p>
                <ul className="text-muted-foreground list-disc space-y-2 ps-6">
                  <li>
                    <strong>Transparency:</strong> Environmental data from
                    OpenSensor.Space is publicly available in open Parquet
                    format under the{' '}
                    <strong>
                      Creative Commons Attribution 4.0 International (CC BY 4.0)
                    </strong>{' '}
                    license
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
              <section id="your-rights" className="brand-panel scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <BrandIcon className="h-11 w-11">
                    <Users className="h-5 w-5" />
                  </BrandIcon>
                  <h2 className="m-0 text-2xl md:text-3xl">Your Rights</h2>
                </div>
                <p className="text-muted-foreground">
                  Depending on your location, you may have the following rights
                  regarding your personal information:
                </p>
                <ul className="text-muted-foreground list-disc space-y-2 ps-6">
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
                    className="text-foreground underline underline-offset-4"
                  >
                    hi@walkthru.earth
                  </a>
                  .
                </p>
              </section>

              {/* Data Security */}
              <section id="security" className="brand-panel scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <BrandIcon className="h-11 w-11">
                    <Lock className="h-5 w-5" />
                  </BrandIcon>
                  <h2 className="m-0 text-2xl md:text-3xl">Data Security</h2>
                </div>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational measures
                  to protect your information:
                </p>
                <ul className="text-muted-foreground list-disc space-y-1 ps-6">
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
              <section id="children" className="brand-panel scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <BrandIcon className="h-11 w-11">
                    <Shield className="h-5 w-5" />
                  </BrandIcon>
                  <h2 className="m-0 text-2xl md:text-3xl">
                    Children&apos;s Privacy
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  Our platforms are not directed at children under 13 years of
                  age. We do not knowingly collect personal information from
                  children. If you believe we have inadvertently collected
                  information from a child, please contact us immediately.
                </p>
              </section>

              {/* Policy Changes */}
              <section id="changes" className="brand-panel scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <BrandIcon className="h-11 w-11">
                    <FileText className="h-5 w-5" />
                  </BrandIcon>
                  <h2 className="m-0 text-2xl md:text-3xl">Policy Changes</h2>
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
              <section id="contact" className="brand-panel scroll-mt-24">
                <div className="mb-4 flex items-center gap-3">
                  <BrandIcon className="h-11 w-11">
                    <Mail className="h-5 w-5" />
                  </BrandIcon>
                  <h2 className="m-0 text-2xl md:text-3xl">Contact Us</h2>
                </div>
                <p className="text-muted-foreground">
                  If you have any questions, concerns, or requests regarding
                  this Privacy Policy or our data practices, please contact us:
                </p>
                <BrandPanel tone="green" className="mt-5">
                  <p className="font-semibold">walkthru.earth</p>
                  <p className="text-muted-foreground mt-2">
                    Email:{' '}
                    <a
                      href="mailto:hi@walkthru.earth"
                      className="font-bold underline underline-offset-4"
                    >
                      hi@walkthru.earth
                    </a>
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Website:{' '}
                    <a
                      href="https://walkthru.earth"
                      className="font-bold underline underline-offset-4"
                    >
                      walkthru.earth
                    </a>
                  </p>
                </BrandPanel>
                <p className="text-muted-foreground mt-4">
                  We aim to respond to all inquiries within 30 days.
                </p>
              </section>
            </div>
          </div>
        </Container>
      </BrandPage>
      <Footer />
    </Localized>
  );
}
