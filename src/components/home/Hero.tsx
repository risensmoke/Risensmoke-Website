'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Hero = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-b from-smoke-black via-ash-gray to-smoke-black">
          <div className="absolute inset-0 bg-black/40" />
        </div>
        {/* Animated Smoke Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-smoke-black/80 via-smoke-black/40 to-transparent" />
      </div>

      {/* Animated Smoke Particles - Only render after mount to avoid hydration issues */}
      {mounted && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="smoke-particle"
              style={{
                left: `${(i * 7) % 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${15 + (i % 3) * 5}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Glowing Embers Effect */}
      {mounted && (
        <div className="absolute inset-0 z-5">
          {[...Array(8)].map((_, i) => (
            <div
              key={`ember-${i}`}
              className="absolute w-2 h-2 rounded-full animate-pulse"
              style={{
                backgroundColor: '#FF6B35',
                boxShadow: '0 0 20px #FF6B35',
                left: `${Math.random() * 100}%`,
                top: `${50 + Math.random() * 50}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-20 text-center max-w-4xl mx-auto px-4">
        <div className="mb-6 logo-glow">
          <Image
            src="/Assets/Logo/Logo_RiseNSmoke.svg"
            alt="Rise N' Smoke BBQ Logo"
            width={200}
            height={200}
            className="mx-auto shadow-2xl hover:scale-105 transition-transform duration-500"
            style={{ backgroundColor: 'transparent', mixBlendMode: 'normal' }}
            priority
          />
        </div>

        <h1 className="text-hero text-fire-gradient mb-4 animate-fade-in" style={{ fontFamily: "'Rye', serif" }}>
          RISE N&apos; SMOKE
        </h1>

        <h2 className="text-h2 text-primary-gradient mb-6 animate-slide-up" style={{ fontFamily: "'Alfa Slab One', serif" }}>
          Pit BBQ: The Rise &amp; Transform Method™
        </h2>

        <p className="text-large mb-8 max-w-2xl mx-auto animate-fade-in-delayed" style={{ color: "#F8F8F8" }}>
          We&apos;ve figured out the secret of how smoke actually works - when we burn our hickory and oak just right,
          the smoke rises in perfect streams, opening up the meat like tiny doors.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delayed">
          <Link href="/order" className="btn-primary text-lg hover-flame" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '1rem', paddingBottom: '1rem' }}>
            Order Online Now
          </Link>
          <Link href="/menu" className="btn-secondary text-lg" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '1rem', paddingBottom: '1rem' }}>
            View Our Menu
          </Link>
        </div>

        <p className="text-base mt-6 italic animate-fade-in-more-delayed" style={{ color: "#F8F8F8" }}>
          &quot;Real Smoke. Real Deep. Real Good.&quot;
        </p>
      </div>

      {/* Bottom Flame Effect */}
      {mounted && (
        <div className="absolute bottom-0 left-0 right-0 h-32 z-15">
          <div className="flame-effect" />
        </div>
      )}
    </section>
  );
};

export default Hero;