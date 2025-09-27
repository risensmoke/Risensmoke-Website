'use client';

import Image from 'next/image';
import Link from 'next/link';

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-b from-smoke-black via-ash-gray to-smoke-black">
          {/* Placeholder for background image */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
        {/* Smoke Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-smoke-black/80 via-smoke-black/40 to-transparent" />
      </div>

      {/* Smoke Animation Particles */}
      <div className="absolute inset-0 z-10">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="smoke-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-20 text-center max-w-4xl mx-auto px-4">
        <h1 className="font-primary text-hero text-fire-gradient mb-4">
          RISE N&apos; SMOKE
        </h1>

        <h2 className="font-secondary text-h2 text-primary-gradient mb-6">
          The Rise &amp; Transform Method™
        </h2>

        <p className="font-body text-large text-smoke-white mb-8 max-w-2xl mx-auto">
          We&apos;ve figured out the secret of how smoke actually works - when we burn our hickory and oak just right,
          the smoke rises in perfect streams, opening up the meat like tiny doors.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/order" className="btn-primary text-lg px-8 py-4">
            Order Online Now
          </Link>
          <Link href="/menu" className="btn-secondary text-lg px-8 py-4">
            View Our Menu
          </Link>
        </div>

        <p className="font-body text-base text-smoke-white/80 mt-6 italic">
          &quot;Real Smoke. Real Deep. Real Good.&quot;
        </p>
      </div>
    </section>
  );
};

export default Hero;