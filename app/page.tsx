import Hero from "@/components/home/Hero";
import FoodCarousel from "@/components/home/FoodCarousel";
import SmokeMaster from "@/components/home/SmokeMaster";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />

      {/* Featured Food Carousel */}
      <FoodCarousel />

      {/* About The Method Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-h1 text-center mb-4 text-fire-gradient">
            The Secret&apos;s in the Rise
          </h2>
          <p className="text-center text-large mb-12 max-w-3xl mx-auto" style={{ color: "#F8F8F8" }}>
            Most folks just let smoke happen. We make it work for us.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <h3 className="text-h3 mb-4" style={{ color: "#FF6B35" }}>
                It&apos;s All About the Rise
              </h3>
              <p style={{ color: "#F8F8F8" }}>
                When we burn our hickory and oak just right, the smoke doesn&apos;t just sit there—it rises up
                in perfect little streams, carrying all that wood flavor with it.
              </p>
            </div>

            <div className="card text-center">
              <h3 className="text-h3 mb-4" style={{ color: "#FF6B35" }}>
                Smoke That Actually Soaks In
              </h3>
              <p style={{ color: "#F8F8F8" }}>
                When smoke gets hot enough and rises just right, it opens up the meat like tiny doors,
                letting all that smoky goodness get deep inside.
              </p>
            </div>

            <div className="card text-center">
              <h3 className="text-h3 mb-4" style={{ color: "#FF6B35" }}>
                Our Secret Timing
              </h3>
              <p style={{ color: "#F8F8F8" }}>
                We&apos;ve spent years learning exactly when that smoke is doing its best work.
                Hit it just right, and that smoke transforms your meat into something special.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The SmokeMaster Section */}
      <SmokeMaster />

      {/* Location & Hours Section */}
      <section className="py-20 px-4" style={{ backgroundColor: '#1C1C1C' }}>
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-h1 mb-8 text-fire-gradient">
            Location & Hours
          </h2>

          <div className="card">
            <div className="mb-6">
              <h3 className="text-h3 mb-4" style={{ color: "#FF6B35" }}>Location</h3>
              <p className="text-lg" style={{ color: "#F8F8F8" }}>401 Abbott Avenue</p>
              <p className="text-lg" style={{ color: "#F8F8F8" }}>Hillsboro, Texas 76645</p>
              <p className="text-lg font-semibold mt-2" style={{ color: "#D32F2F" }}>(254) 221-6247</p>
            </div>

            <div>
              <h3 className="text-h3 mb-4" style={{ color: "#FF6B35" }}>Hours</h3>
              <div className="space-y-2" style={{ color: "#F8F8F8" }}>
                <p>Sunday: Closed</p>
                <p>Monday: Closed</p>
                <p className="font-semibold" style={{ color: "#F8F8F8" }}>Tuesday - Saturday: 11:00 AM - 8:00 PM</p>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/order" className="btn-primary">
                Order for Pickup
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}