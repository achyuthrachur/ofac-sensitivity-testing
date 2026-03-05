import Link from 'next/link';
import { ArrowRight } from 'iconsax-reactjs';

export function HeroSection() {
  return (
    <section className="bg-crowe-indigo-dark py-24 lg:py-32 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-bold max-w-3xl leading-tight mx-auto">
          Test your OFAC screening before your client does.
        </h1>
        <p className="text-lg text-white/80 mt-6 max-w-xl mx-auto">
          A live sensitivity-testing tool that degrades real-world name variations against 285 synthetic
          SDN entries. No file prep. No waiting.
        </p>
        <Link
          href="/tool"
          className="mt-10 inline-flex items-center gap-1 bg-crowe-amber text-crowe-indigo-dark font-bold px-8 py-4 rounded-lg hover:bg-crowe-amber-dark transition-colors duration-200 shadow-lg"
        >
          Configure Your Test
          <ArrowRight variant="Bold" size={18} color="currentColor" />
        </Link>
      </div>
    </section>
  );
}
