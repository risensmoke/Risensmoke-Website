import SmokeMaster from "@/components/home/SmokeMaster";

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1C1C1C' }}>
      {/* The SmokeMaster Section */}
      <SmokeMaster />

      {/* Additional About Content */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-h1 mb-8 text-fire-gradient" style={{ fontFamily: "'Rye', serif" }}>
            Our Story
          </h2>

          <div className="space-y-6" style={{ color: '#F8F8F8' }}>
            <p className="text-lg leading-relaxed">
              Rise N&apos; Smoke BBQ started with a simple belief: when smoke rises just right,
              meat transforms into something magical. For over a decade, we&apos;ve been perfecting
              The Rise & Transform Method™, turning ordinary cuts into extraordinary experiences.
            </p>

            <p className="text-lg leading-relaxed">
              Located in the heart of Hillsboro, Texas, we wake up every morning at 4 AM to
              start our fires. By the time you walk through our doors, every piece of meat has
              been kissed by 12 hours of hickory and oak smoke, transformed into tender,
              flavorful perfection.
            </p>

            <p className="text-lg leading-relaxed">
              We don&apos;t just cook BBQ - we create an experience. From our Heavenly Brisket to
              our Sacred Ribs, every dish tells a story of patience, dedication, and the ancient
              art of smoke transformation.
            </p>
          </div>

          <div className="mt-12 p-8 rounded-lg" style={{
            backgroundColor: 'rgba(40, 40, 40, 0.8)',
            border: '2px solid rgba(255, 107, 53, 0.3)'
          }}>
            <h3 className="text-h2 mb-4" style={{ color: '#FF6B35' }}>
              Visit Us Today
            </h3>
            <p className="text-lg mb-2" style={{ color: '#F8F8F8' }}>
              401 Abbott Avenue, Hillsboro, Texas 76645
            </p>
            <p className="text-lg mb-4" style={{ color: '#FFD700' }}>
              (254) 221-6247
            </p>
            <p className="text-lg" style={{ color: '#F8F8F8' }}>
              Tuesday - Saturday: 11:00 AM - 8:00 PM
            </p>
            <p className="text-sm mt-2" style={{ color: '#FF6B35' }}>
              (Closed Sunday & Monday)
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}