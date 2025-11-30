import { Navbar } from '@/components/navigation/navbar';
import { Hero } from '@/components/sections/hero';
import { PatternDetection } from '@/components/sections/pattern-detection';
import { Initiatives } from '@/components/sections/initiatives';
import { Vision } from '@/components/sections/vision';
import { CTA } from '@/components/sections/cta';
import { Footer } from '@/components/sections/footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Initiatives />
        <PatternDetection />
        <Vision />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
