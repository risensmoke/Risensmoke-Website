'use client';

import Image from 'next/image';
import { Flame } from 'lucide-react';

const SmokeMaster = () => {
  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{ backgroundColor: '#1C1C1C' }}>
      {/* Background Smoke Effect */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(255, 107, 53, 0.2), transparent 70%)',
            animation: 'pulseGlow 4s ease-in-out infinite'
          }}
        />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Full Width Section Headers */}
        <div className="text-center mb-12">
          <h2
            className="text-hero mb-4"
            style={{
              fontFamily: "'Rye', serif",
              background: 'linear-gradient(135deg, #FF6B35, #FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(255, 107, 53, 0.5)',
              letterSpacing: '2px'
            }}
          >
            THE SMOKEMASTER
          </h2>

          <h3
            className="text-h2"
            style={{
              color: '#FF6B35',
              fontFamily: "'Alfa Slab One', serif",
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
            }}
          >
            The Rise & Transform Method™
          </h3>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/Image_Smokemaster.jpg"
                alt="The SmokeMaster"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
                priority
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Badge */}
              <div
                className="absolute top-6 right-6 px-6 py-3 rounded-full backdrop-blur-sm"
                style={{
                  backgroundColor: 'rgba(211, 47, 47, 0.9)',
                  boxShadow: '0 8px 32px rgba(211, 47, 47, 0.4)'
                }}
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5" style={{ color: '#FFD700' }} />
                  <span className="font-bold text-sm" style={{ color: '#F8F8F8' }}>
                    MASTER OF SMOKE
                  </span>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div
              className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full opacity-50"
              style={{
                background: 'radial-gradient(circle, rgba(255, 107, 53, 0.4), transparent)',
                filter: 'blur(40px)'
              }}
            />
          </div>

          {/* Text Content */}
          <div className="text-center md:text-left">
            <p className="text-lg mb-6 leading-relaxed" style={{ color: '#F8F8F8' }}>
              For over 15 years, our SmokeMaster has perfected the ancient art of BBQ transformation.
              Using a secret blend of hickory and oak, timing the smoke to rise at just the right moment,
              creating that perfect bark and smoke ring that turns good meat into something heavenly.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <div
                  className="w-2 h-2 rounded-full mt-2"
                  style={{ backgroundColor: '#FF6B35', boxShadow: '0 0 10px rgba(255, 107, 53, 0.6)' }}
                />
                <p style={{ color: '#F8F8F8' }}>
                  <strong>Temperature Control:</strong> Maintaining the perfect 225°F for hours on end
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-2 h-2 rounded-full mt-2"
                  style={{ backgroundColor: '#FF6B35', boxShadow: '0 0 10px rgba(255, 107, 53, 0.6)' }}
                />
                <p style={{ color: '#F8F8F8' }}>
                  <strong>Smoke Timing:</strong> Knowing exactly when the smoke rises and transforms
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-2 h-2 rounded-full mt-2"
                  style={{ backgroundColor: '#FF6B35', boxShadow: '0 0 10px rgba(255, 107, 53, 0.6)' }}
                />
                <p style={{ color: '#F8F8F8' }}>
                  <strong>The Secret:</strong> It&apos;s not just cooking - it&apos;s a spiritual transformation
                </p>
              </div>
            </div>

            <div
              className="inline-block p-6 rounded-lg"
              style={{
                backgroundColor: 'rgba(40, 40, 40, 0.8)',
                border: '2px solid rgba(255, 107, 53, 0.3)'
              }}
            >
              <p
                className="text-2xl font-bold mb-2"
                style={{
                  color: '#FFD700',
                  fontFamily: "'Alfa Slab One', serif",
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
                }}
              >
                "When smoke rises just right,
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  color: '#FFD700',
                  fontFamily: "'Alfa Slab One', serif",
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
                }}
              >
                meat transforms into magic."
              </p>
              <p className="text-right mt-3" style={{ color: '#FF6B35', fontStyle: 'italic' }}>
                - The SmokeMaster
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmokeMaster;