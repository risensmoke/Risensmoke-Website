'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Flame, Clock, Award } from 'lucide-react';

const FoodCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      image: '/Assets/plate-rib-large.PNG',
      title: 'Rise N Smoke A Lot',
      description: 'Our signature rib plate featuring fall-off-the-bone tender ribs, blessed with hours of slow smoking. The Rise & Transform Method™ delivers perfect bark and succulent meat.',
      price: '$18.45',
      highlight: 'Signature Plate'
    },
    {
      image: '/Assets/family-meat-platter.PNG',
      title: 'Family Feast',
      description: 'Feed the whole crew with our family platter. A generous selection of our finest smoked meats, perfect for gatherings and celebrations.',
      price: '$120.50',
      highlight: 'Best Seller'
    },
    {
      image: '/Assets/plate-3meat.PNG',
      title: 'Revelation Plate',
      description: 'The truth about real smoke revealed with three of our finest meats. Experience brisket, ribs, and sausage all transformed through our smoking mastery.',
      price: '$18.45',
      highlight: 'Award Winner'
    },
    {
      image: '/Assets/sand-beef-brisket-saus.jpg',
      title: 'Smokey-Duo',
      description: 'Double smoked, double flavor! Our signature brisket paired with savory sausage on a toasted bun. A taste of Texas in every bite.',
      price: '$13.00',
      highlight: 'Crowd Favorite'
    }
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  return (
    <section className="py-16 px-4" style={{ backgroundColor: '#1C1C1C' }}>
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-h1 mb-3 text-fire-gradient" style={{ fontFamily: "'Rye', serif" }}>
            Taste the Transformation
          </h2>
          <p className="text-lg" style={{ color: '#F8F8F8' }}>
            Each dish blessed by smoke and perfected through years of dedication
          </p>
        </div>

        {/* Carousel Container - Dual Card Layout */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={index} className="min-w-full">
                  <div
                    className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden"
                    style={{
                      backgroundColor: 'rgba(40, 40, 40, 0.9)',
                      border: '2px solid rgba(255, 107, 53, 0.3)'
                    }}
                  >
                    {/* Image Section - Left */}
                    <div className="relative h-96 md:h-full min-h-[400px]">
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50" />

                      {/* Highlight Badge */}
                      <div
                        className="absolute top-6 left-6 px-4 py-2 rounded-full"
                        style={{
                          backgroundColor: 'rgba(255, 107, 53, 0.9)',
                          boxShadow: '0 4px 20px rgba(255, 107, 53, 0.5)'
                        }}
                      >
                        <span className="text-sm font-bold" style={{ color: '#F8F8F8' }}>
                          {slide.highlight}
                        </span>
                      </div>
                    </div>

                    {/* Content Section - Right */}
                    <div className="p-10 md:p-12 flex flex-col justify-center">
                      <h3
                        className="text-h2 mb-4"
                        style={{
                          color: '#FF6B35',
                          fontFamily: "'Alfa Slab One', serif",
                          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
                        }}
                      >
                        {slide.title}
                      </h3>

                      <p
                        className="text-lg mb-6 leading-relaxed"
                        style={{ color: '#F8F8F8' }}
                      >
                        {slide.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm mb-1" style={{ color: '#F8F8F8' }}>
                            Starting at
                          </p>
                          <p
                            className="text-3xl font-bold"
                            style={{
                              color: '#FFD700',
                              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
                            }}
                          >
                            {slide.price}
                          </p>
                        </div>

                        <button
                          className="btn-primary"
                          style={{ padding: '0.75rem 2rem' }}
                        >
                          Order Now
                        </button>
                      </div>

                      {/* Decorative Smoke Effect */}
                      <div
                        className="absolute bottom-0 right-0 w-32 h-32 opacity-20"
                        style={{
                          background: 'radial-gradient(circle, rgba(255, 107, 53, 0.3), transparent)',
                          filter: 'blur(40px)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute -left-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all duration-300 hover:scale-110 carousel-button"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" style={{ color: '#F8F8F8' }} />
          </button>

          <button
            onClick={nextSlide}
            className="absolute -right-4 top-1/2 -translate-y-1/2 p-3 rounded-full transition-all duration-300 hover:scale-110 carousel-button"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" style={{ color: '#F8F8F8' }} />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="transition-all duration-300"
                style={{
                  width: currentSlide === index ? '32px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  backgroundColor: currentSlide === index ? '#FF6B35' : 'rgba(248, 248, 248, 0.3)',
                  boxShadow: currentSlide === index ? '0 0 15px rgba(255, 107, 53, 0.6)' : 'none'
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Feature Icons Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(40, 40, 40, 0.5)' }}>
            <Flame className="w-8 h-8" style={{ color: '#FF6B35' }} />
            <div>
              <h4 className="font-bold" style={{ color: '#F8F8F8' }}>
                Wood-Fired Daily
              </h4>
              <p className="text-sm" style={{ color: '#F8F8F8' }}>
                Fresh hickory & oak blend
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(40, 40, 40, 0.5)' }}>
            <Clock className="w-8 h-8" style={{ color: '#FF6B35' }} />
            <div>
              <h4 className="font-bold" style={{ color: '#F8F8F8' }}>
                12-Hour Process
              </h4>
              <p className="text-sm" style={{ color: '#F8F8F8' }}>
                Low and slow perfection
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(40, 40, 40, 0.5)' }}>
            <Award className="w-8 h-8" style={{ color: '#FF6B35' }} />
            <div>
              <h4 className="font-bold" style={{ color: '#F8F8F8' }}>
                Award Winning
              </h4>
              <p className="text-sm" style={{ color: '#F8F8F8' }}>
                Best BBQ in Hillsboro
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoodCarousel;