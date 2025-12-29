'use client';

const SmokeMaster = () => {
  return (
    <section
      className="py-12 md:py-20 px-4 relative overflow-hidden"
      style={{ backgroundColor: '#1C1C1C' }}
    >
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

      <div className="container mx-auto max-w-3xl relative z-10">
        {/* Section Headers */}
        <div className="text-center mb-8 md:mb-12">
          <h2
            className="text-3xl md:text-5xl lg:text-hero mb-4"
            style={{
              fontFamily: "'Rye', serif",
              background: 'linear-gradient(135deg, #FF6B35, #FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '2px',
              lineHeight: '1.2'
            }}
          >
            THE SMOKEMASTER
          </h2>

          <h3
            className="text-xl md:text-2xl lg:text-h2 px-4"
            style={{
              color: '#FF6B35',
              fontFamily: "'Rye', serif",
              lineHeight: '1.3'
            }}
          >
            The Rise & Transform Method™
          </h3>
        </div>

        {/* Text Content - Centered */}
        <div className="text-center">
          <p
            className="text-base md:text-lg mb-6 leading-relaxed px-2 md:px-0"
            style={{ color: '#F8F8F8' }}
          >
            For over 15 years, our SmokeMaster has perfected the ancient art of BBQ transformation.
            Using oak wood, timing the smoke to rise at just the right moment,
            creating that perfect bark and smoke ring that turns good meat into something heavenly.
          </p>

          <div className="space-y-4 mb-8 px-2 md:px-0 inline-block text-left">
            <div className="flex items-start gap-3">
              <div
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: '#FF6B35', boxShadow: '0 0 10px rgba(255, 107, 53, 0.6)' }}
              />
              <p className="text-sm md:text-base" style={{ color: '#F8F8F8' }}>
                <strong>Temperature Control:</strong> Maintaining the perfect 225°F for hours on end
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: '#FF6B35', boxShadow: '0 0 10px rgba(255, 107, 53, 0.6)' }}
              />
              <p className="text-sm md:text-base" style={{ color: '#F8F8F8' }}>
                <strong>Smoke Timing:</strong> Knowing exactly when the smoke rises and transforms
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: '#FF6B35', boxShadow: '0 0 10px rgba(255, 107, 53, 0.6)' }}
              />
              <p className="text-sm md:text-base" style={{ color: '#F8F8F8' }}>
                <strong>The Secret:</strong> It&apos;s not just cooking - it&apos;s a spiritual transformation
              </p>
            </div>
          </div>

          <div
            className="inline-block p-4 md:p-6 rounded-lg"
            style={{
              backgroundColor: 'rgba(40, 40, 40, 0.8)',
              border: '2px solid rgba(255, 107, 53, 0.3)'
            }}
          >
            <p
              className="text-lg md:text-xl lg:text-2xl font-bold mb-2"
              style={{
                color: '#FFD700',
                fontFamily: "'Rye', serif",
                lineHeight: '1.3'
              }}
            >
              "When smoke rises just right,
            </p>
            <p
              className="text-lg md:text-xl lg:text-2xl font-bold"
              style={{
                color: '#FFD700',
                fontFamily: "'Rye', serif",
                lineHeight: '1.3'
              }}
            >
              meat transforms into magic."
            </p>
            <p
              className="text-right mt-3 text-sm md:text-base"
              style={{ color: '#FF6B35', fontStyle: 'italic' }}
            >
              - The SmokeMaster
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmokeMaster;