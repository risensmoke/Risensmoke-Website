'use client';

import { useState } from 'react';
import { MapPin, Phone, Clock, Mail } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen py-20" style={{ backgroundColor: '#1C1C1C' }}>
      <div className="container mx-auto max-w-7xl px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1
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
            Follow the rising smoke!
          </h1>
          <p className="text-xl" style={{ color: '#F8F8F8' }}>
            Get in touch with Rise N' Smoke BBQ
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-h2 mb-8" style={{ color: '#FF6B35' }}>
              Visit Us
            </h2>

            {/* Location */}
            <div className="mb-8">
              <div className="flex items-start gap-4 mb-6">
                <MapPin className="w-6 h-6 mt-1" style={{ color: '#FF6B35' }} />
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#FFD700' }}>Location</h3>
                  <p className="text-lg" style={{ color: '#F8F8F8' }}>
                    401 Abbott Avenue<br />
                    Hillsboro, Texas 76645
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4 mb-6">
                <Phone className="w-6 h-6 mt-1" style={{ color: '#FF6B35' }} />
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#FFD700' }}>Phone</h3>
                  <p className="text-lg" style={{ color: '#F8F8F8' }}>
                    (254) 221-6247
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4 mb-6">
                <Clock className="w-6 h-6 mt-1" style={{ color: '#FF6B35' }} />
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#FFD700' }}>Hours</h3>
                  <div className="text-lg" style={{ color: '#F8F8F8' }}>
                    <p className="mb-1">Tuesday - Saturday: 11:00 AM - 8:00 PM</p>
                    <p className="text-sm" style={{ color: '#FF6B35' }}>
                      (Closed Sunday & Monday)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Embed (Placeholder) */}
            <div
              className="rounded-lg overflow-hidden"
              style={{
                height: '300px',
                backgroundColor: 'rgba(40, 40, 40, 0.8)',
                border: '2px solid rgba(255, 107, 53, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4" style={{ color: '#FF6B35' }} />
                <p style={{ color: '#F8F8F8' }}>401 Abbott Avenue</p>
                <p style={{ color: '#F8F8F8' }}>Hillsboro, TX 76645</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-h2 mb-8" style={{ color: '#FF6B35' }}>
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium" style={{ color: '#FFD700' }}>
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(40, 40, 40, 0.8)',
                    border: '2px solid rgba(255, 107, 53, 0.3)',
                    color: '#F8F8F8'
                  }}
                />
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium" style={{ color: '#FFD700' }}>
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(40, 40, 40, 0.8)',
                    border: '2px solid rgba(255, 107, 53, 0.3)',
                    color: '#F8F8F8'
                  }}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block mb-2 text-sm font-medium" style={{ color: '#FFD700' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(40, 40, 40, 0.8)',
                    border: '2px solid rgba(255, 107, 53, 0.3)',
                    color: '#F8F8F8'
                  }}
                />
              </div>

              <div>
                <label htmlFor="message" className="block mb-2 text-sm font-medium" style={{ color: '#FFD700' }}>
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg resize-none"
                  style={{
                    backgroundColor: 'rgba(40, 40, 40, 0.8)',
                    border: '2px solid rgba(255, 107, 53, 0.3)',
                    color: '#F8F8F8'
                  }}
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-lg font-bold text-lg transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35, #D32F2F)',
                  color: '#F8F8F8',
                  boxShadow: '0 8px 32px rgba(211, 47, 47, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(211, 47, 47, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(211, 47, 47, 0.4)';
                }}
              >
                Send Message
              </button>
            </form>

            <div className="mt-8 p-6 rounded-lg" style={{
              backgroundColor: 'rgba(40, 40, 40, 0.8)',
              border: '2px solid rgba(255, 107, 53, 0.3)'
            }}>
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-5 h-5" style={{ color: '#FF6B35' }} />
                <h3 className="text-lg font-bold" style={{ color: '#FFD700' }}>
                  Catering Inquiries
                </h3>
              </div>
              <p style={{ color: '#F8F8F8' }}>
                Planning an event? Let us bring the smoke to you! Contact us for catering options
                and custom orders for your special occasions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}