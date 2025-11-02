'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Flame, Heart, Users, Award, BookOpen, Sparkles } from 'lucide-react';

export default function SmokeMasterPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1C1C1C' }}>
      {/* Hero Section with Parallax */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <Image
            src="/Image_Smokemaster.jpg"
            alt="Mike Johnson - The SmokeMaster"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
        </div>

        {/* Smoke Animation */}
        <div className="absolute inset-0 opacity-30">
          <div className="smoke-animation" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto" style={{ padding: '0 1rem' }}>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl mb-6"
            style={{
              fontFamily: "'Rye', serif",
              background: 'linear-gradient(135deg, #FF6B35, #FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '3px'
            }}
          >
            THE SMOKEMASTER
          </h1>
          <h2
            className="text-2xl sm:text-3xl lg:text-4xl mb-8"
            style={{
              fontFamily: "'Alfa Slab One', serif",
              color: '#FF6B35'
            }}
          >
            Mike Johnson's Journey
          </h2>
          <p
            className="text-xl sm:text-2xl italic"
            style={{
              color: '#FFD700',
              fontFamily: "'Rye', serif"
            }}
          >
            "When smoke rises just right, transformation happens"
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-1 h-16 rounded-full bg-gradient-to-b from-transparent via-orange-500 to-transparent" />
        </div>
      </div>

      {/* The Calling Section */}
      <section className="py-20" style={{ padding: '5rem 1rem' }}>
        <div className="max-w-6xl mx-auto">
          <div className="max-w-4xl mx-auto">
            <div>
              <h2
                className="text-3xl sm:text-4xl mb-6"
                style={{
                  fontFamily: "'Rye', serif",
                  color: '#FFD700'
                }}
              >
                <Flame className="inline w-8 h-8 mr-3" style={{ color: '#FF6B35' }} />
                The Calling
              </h2>
              <div className="prose prose-lg" style={{ color: '#F8F8F8' }}>
                <p className="mb-4 leading-relaxed">
                  Mike Johnson never intended to become Hillsboro&apos;s most talked-about pitmaster.
                  Raised in a family where Sunday dinners were sacred and the kitchen was the heart
                  of every gathering, Mike thought his path was set: work hard, retire, enjoy life.
                </p>
                <p
                  className="text-xl italic mt-6 p-4 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    borderLeft: '4px solid #FF6B35',
                    color: '#FFD700'
                  }}
                >
                  But sometimes, the Lord has different plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Discovery Section */}
      <section
        className="py-20"
        style={{
          padding: '5rem 1rem',
          background: 'linear-gradient(180deg, rgba(255, 107, 53, 0.05) 0%, transparent 100%)'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl mb-12 text-center"
            style={{
              fontFamily: "'Rye', serif",
              color: '#FFD700'
            }}
          >
            <BookOpen className="inline w-8 h-8 mr-3" style={{ color: '#FF6B35' }} />
            The Discovery
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              className="p-6 rounded-lg"
              style={{
                backgroundColor: 'rgba(40, 40, 40, 0.8)',
                border: '2px solid rgba(255, 107, 53, 0.3)'
              }}
            >
              <p className="mb-4" style={{ color: '#F8F8F8' }}>
                After retirement, Mike spent his weekends with faith, family and smoke!
                He&apos;d spend hours in his backyard, not just cooking, but studying the smoke itself.
                He noticed how different woods created different particle sizes, how temperature
                affected the way smoke moved, how humidity changed everything.
              </p>
            </div>
            <div
              className="p-6 rounded-lg"
              style={{
                backgroundColor: 'rgba(40, 40, 40, 0.8)',
                border: '2px solid rgba(255, 107, 53, 0.3)'
              }}
            >
              <p className="mb-4" style={{ color: '#F8F8F8' }}>
                The breakthrough came during a particularly challenging brisket that just wouldn&apos;t
                take the smoke right. Frustrated, Mike stepped back and really watched the smoke
                for the first time. That&apos;s when he saw it—the way perfect smoke didn&apos;t just drift,
                it rose in organized columns.
              </p>
            </div>
          </div>

          <div
            className="mt-12 p-8 rounded-lg text-center"
            style={{
              backgroundColor: 'rgba(40, 40, 40, 0.8)',
              border: '2px solid rgba(255, 215, 0, 0.3)'
            }}
          >
            <p
              className="text-xl sm:text-2xl italic"
              style={{
                color: '#FFD700',
                fontFamily: "'Alfa Slab One', serif"
              }}
            >
              "It hit me like a revelation. Smoke isn&apos;t random. When you get the conditions
              just right—the smoke rises in beautiful streams, and that&apos;s when the real
              transformation happens."
            </p>
          </div>
        </div>
      </section>

      {/* The Method Section */}
      <section className="py-20" style={{ padding: '5rem 1rem' }}>
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl mb-12 text-center"
            style={{
              fontFamily: "'Rye', serif",
              color: '#FFD700'
            }}
          >
            <Award className="inline w-8 h-8 mr-3" style={{ color: '#FF6B35' }} />
            The Rise & Transform Method™
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div
              className="p-6 rounded-lg text-center"
              style={{
                backgroundColor: 'rgba(40, 40, 40, 0.8)',
                border: '2px solid rgba(255, 107, 53, 0.3)'
              }}
            >
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 107, 53, 0.2)' }}
              >
                <span className="text-3xl">🌡️</span>
              </div>
              <h3 className="text-xl mb-3" style={{ color: '#FFD700' }}>Precision Temperature</h3>
              <p style={{ color: '#F8F8F8' }}>
                Every degree matters. Mike discovered the exact temperatures where smoke
                particles bond perfectly with proteins.
              </p>
            </div>

            <div
              className="p-6 rounded-lg text-center"
              style={{
                backgroundColor: 'rgba(40, 40, 40, 0.8)',
                border: '2px solid rgba(255, 107, 53, 0.3)'
              }}
            >
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 107, 53, 0.2)' }}
              >
                <span className="text-3xl">💨</span>
              </div>
              <h3 className="text-xl mb-3" style={{ color: '#FFD700' }}>Controlled Airflow</h3>
              <p style={{ color: '#F8F8F8' }}>
                Modified smokers create precise airflow patterns, guiding smoke to rise
                in organized columns for deep penetration.
              </p>
            </div>

            <div
              className="p-6 rounded-lg text-center"
              style={{
                backgroundColor: 'rgba(40, 40, 40, 0.8)',
                border: '2px solid rgba(255, 107, 53, 0.3)'
              }}
            >
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 107, 53, 0.2)' }}
              >
                <span className="text-3xl">🪵</span>
              </div>
              <h3 className="text-xl mb-3" style={{ color: '#FFD700' }}>Perfect Wood Selection</h3>
              <p style={{ color: '#F8F8F8' }}>
                Different woods, different results. Mike&apos;s precise blend creates the ideal
                particle size for transformation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Faith & Family Section */}
      <section
        className="py-20"
        style={{
          padding: '5rem 1rem',
          background: 'linear-gradient(180deg, transparent 0%, rgba(255, 107, 53, 0.05) 50%, transparent 100%)'
        }}
      >
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl mb-12 text-center"
            style={{
              fontFamily: "'Rye', serif",
              color: '#FFD700'
            }}
          >
            <Heart className="inline w-8 h-8 mr-3" style={{ color: '#FF6B35' }} />
            Faith & Family
          </h2>

          <div className="max-w-4xl mx-auto">
            <div
              className="p-8 rounded-lg"
              style={{
                backgroundColor: 'rgba(40, 40, 40, 0.8)',
                border: '2px solid rgba(255, 215, 0, 0.3)'
              }}
            >
              <p className="mb-6" style={{ color: '#F8F8F8' }}>
                Tie Johnson still rolls her eyes when she tells the story of how Mike&apos;s
                &quot;little hobby&quot; took over their garage, then their backyard, then eventually
                their entire weekend schedule. But she also remembers the Sunday after church
                when friends and family fought to get the &quot;first slice&quot; of Mike&apos;s brisket.
              </p>

              <blockquote
                className="p-6 my-8 rounded-lg"
                style={{
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  borderLeft: '4px solid #FFD700'
                }}
              >
                <p className="text-lg italic mb-4" style={{ color: '#FFD700' }}>
                  &quot;When you take something ordinary and transform it into something extraordinary,
                  that&apos;s a reflection of what God does in our lives. Every time I see that smoke
                  rising just right, I&apos;m reminded that transformation is possible. Always.&quot;
                </p>
                <cite className="text-sm" style={{ color: '#FF6B35' }}>- Mike Johnson</cite>
              </blockquote>

              <p style={{ color: '#F8F8F8' }}>
                Mike soon realized his obsession with perfect smoke wasn&apos;t just about technique—it
                was about serving others, about bringing people together, about honoring the gifts
                God had given him.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Connection Section */}
      <section className="py-20" style={{ padding: '5rem 1rem' }}>
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl mb-12 text-center"
            style={{
              fontFamily: "'Rye', serif",
              color: '#FFD700'
            }}
          >
            <Users className="inline w-8 h-8 mr-3" style={{ color: '#FF6B35' }} />
            The Community Connection
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="mb-6" style={{ color: '#F8F8F8' }}>
                Word spread quickly and friends started asking Mike to cater church events,
                then graduation parties, then weddings. Each time, people didn&apos;t just
                compliment the food—they talked about the experience.
              </p>
              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: 'rgba(255, 107, 53, 0.1)',
                  border: '2px solid rgba(255, 107, 53, 0.3)'
                }}
              >
                <p className="text-lg italic" style={{ color: '#FFD700' }}>
                  &quot;I kept hearing the same thing: &apos;This doesn&apos;t just taste like smoke
                  on the outside. The smoke goes all the way to the bone.&apos;&quot;
                </p>
              </div>
            </div>
            <div>
              <p className="mb-6" style={{ color: '#F8F8F8' }}>
                From day one, Mike was determined that Rise N&apos; Smoke would be more than just
                another BBQ joint. He took his tagline seriously: &quot;Real Smoke. Real Deep. Real Good.&quot;
                Every menu item tells the story of transformation.
              </p>
              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                  border: '2px solid rgba(255, 215, 0, 0.3)'
                }}
              >
                <p className="text-lg" style={{ color: '#FFD700' }}>
                  &quot;It&apos;s not just the science or the technique. It&apos;s that we understand
                  smoking is about transformation—taking something good and making it extraordinary.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Legacy Section */}
      <section
        className="py-20"
        style={{
          padding: '5rem 1rem',
          background: 'linear-gradient(180deg, transparent 0%, rgba(255, 107, 53, 0.1) 100%)'
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h2
            className="text-3xl sm:text-4xl mb-12"
            style={{
              fontFamily: "'Rye', serif",
              color: '#FFD700'
            }}
          >
            The Legacy Continues
          </h2>

          <div
            className="max-w-4xl mx-auto p-8 rounded-lg"
            style={{
              backgroundColor: 'rgba(40, 40, 40, 0.8)',
              border: '2px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 0 40px rgba(255, 215, 0, 0.2)'
            }}
          >
            <p className="mb-6 text-lg" style={{ color: '#F8F8F8' }}>
              As Rise N&apos; Smoke has grown from Mike&apos;s weekend experiments to Hillsboro&apos;s
              premier BBQ destination, the heart of the operation remains unchanged. It&apos;s still
              about the perfect smoke, still about transformation, still about serving others
              with excellence.
            </p>

            <blockquote
              className="p-6 my-8 rounded-lg"
              style={{
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                border: '2px solid #FF6B35'
              }}
            >
              <p className="text-xl italic mb-4" style={{ color: '#FFD700' }}>
                &quot;This isn&apos;t just my restaurant. This is our community&apos;s place.
                Where people come not just for great food, but for the experience of tasting
                what happens when science, faith, and love for others all come together.&quot;
              </p>
              <cite className="text-sm" style={{ color: '#FF6B35' }}>- Mike Johnson</cite>
            </blockquote>

            <p className="text-lg" style={{ color: '#F8F8F8' }}>
              And every day, as the smoke rises from Mike&apos;s precisely calibrated smokers,
              carrying its transformative magic deep into another perfect brisket, the story
              continues—one plate, one family, one moment of delicious revelation at a time.
            </p>
          </div>

          <div className="mt-16">
            <div
              className="inline-block p-8 rounded-lg"
              style={{
                backgroundColor: 'rgba(40, 40, 40, 0.8)',
                border: '3px solid #FFD700'
              }}
            >
              <p
                className="text-2xl sm:text-3xl font-bold mb-4"
                style={{
                  fontFamily: "'Alfa Slab One', serif",
                  color: '#FFD700'
                }}
              >
                &quot;When smoke rises just right,<br />
                meat transforms into magic.&quot;
              </p>
              <p className="text-lg" style={{ color: '#FF6B35' }}>
                - Michael Johnson, Owner & SmokeMaster<br />
                Rise N&apos; Smoke Pit BBQ
              </p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes smoke {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.3; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-100vh) rotate(180deg); opacity: 0; }
        }

        .smoke-animation::before,
        .smoke-animation::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255, 107, 53, 0.3) 0%, transparent 70%);
          animation: smoke 15s infinite;
        }

        .smoke-animation::after {
          animation-delay: 7.5s;
        }
      `}</style>
    </div>
  );
}