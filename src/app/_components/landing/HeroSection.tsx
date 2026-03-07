import Link from 'next/link';
import { ArrowRight } from 'iconsax-reactjs';
import { ClientHeroHeadline } from './ClientHeroHeadline';

export function HeroSection() {
  return (
    <section className="bg-crowe-indigo-dark py-24 lg:py-32 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <ClientHeroHeadline />
        <Link
          href="/tool"
          className="cta-button mt-10 inline-flex items-center gap-1 bg-crowe-amber text-crowe-indigo-dark font-bold px-8 py-4 rounded-lg hover:bg-crowe-amber-dark transition-colors duration-200"
        >
          Configure Your Test
          <ArrowRight variant="Bold" size={18} color="currentColor" />
        </Link>
        <div className="mt-4">
          <Link
            href="/guide"
            className="inline-flex items-center gap-1 text-white/70 text-sm hover:text-white transition-colors underline-offset-2 hover:underline"
          >
            Read the user guide
            <ArrowRight variant="Linear" size={14} color="currentColor" />
          </Link>
        </div>
      </div>
    </section>
  );
}
