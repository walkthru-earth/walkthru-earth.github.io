import { socialMetadata } from '@/lib/social-preview/cards';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | walkthru.earth',
  description:
    'Our commitment to your privacy and data protection. Learn how walkthru.earth collects, uses, and protects your information across our urban intelligence platforms.',
  keywords:
    'privacy policy, data protection, GDPR, cookie policy, IoT privacy, urban data, walkthru.earth',
  ...socialMetadata('privacy'),
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
