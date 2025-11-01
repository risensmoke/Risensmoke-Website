'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Phone, MapPin, Clock, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="mt-auto"
      style={{
        backgroundColor: '#2a2a2a',
        borderTop: '3px solid #FF6B35'
      }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Restaurant Info */}
          <div>
            <div className="flex items-center mb-4">
              <Image
                src="/Assets/Logo/Logo_RiseNSmoke.svg"
                alt="Rise N' Smoke BBQ"
                width={50}
                height={50}
                className="mr-3"
              />
              <h3 className="text-xl font-bold" style={{ color: '#FFD700' }}>
                Rise N&apos; Smoke
              </h3>
            </div>
            <p className="text-sm mb-4" style={{ color: '#F8F8F8' }}>
              Real Smoke. Real Deep. Real Good.
            </p>
            <p className="text-sm" style={{ color: '#F8F8F8' }}>
              Experience the transformation when smoke rises just right.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4" style={{ color: '#FFD700' }}>
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/menu"
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ color: '#F8F8F8' }}
                >
                  View Menu
                </Link>
              </li>
              <li>
                <Link
                  href="/order"
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ color: '#F8F8F8' }}
                >
                  Order Online
                </Link>
              </li>
              <li>
                <Link
                  href="/smokemaster"
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ color: '#F8F8F8' }}
                >
                  The SmokeMaster
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ color: '#F8F8F8' }}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ color: '#F8F8F8' }}
                >
                  Contact & Catering
                </Link>
              </li>
            </ul>
          </div>

          {/* Location & Hours */}
          <div>
            <h4 className="text-lg font-bold mb-4" style={{ color: '#FFD700' }}>
              Visit Us
            </h4>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" style={{ color: '#FF6B35' }} />
                <div>
                  <p className="text-sm" style={{ color: '#F8F8F8' }}>
                    401 Abbott Avenue<br />
                    Hillsboro, Texas 76645
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" style={{ color: '#FF6B35' }} />
                <a
                  href="tel:254-221-6247"
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ color: '#F8F8F8' }}
                >
                  (254) 221-6247
                </a>
              </div>
              <div className="flex items-start">
                <Clock className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" style={{ color: '#FF6B35' }} />
                <div>
                  <p className="text-sm" style={{ color: '#F8F8F8' }}>
                    Tue-Sat: 11:00 AM - 8:00 PM<br />
                    Sun-Mon: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-lg font-bold mb-4" style={{ color: '#FFD700' }}>
              Connect With Us
            </h4>

            {/* Social Media Icons */}
            <div className="flex space-x-4 mb-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" style={{ color: '#FF6B35' }} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" style={{ color: '#FF6B35' }} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6" style={{ color: '#FF6B35' }} />
              </a>
            </div>

            {/* Newsletter Signup */}
            <div>
              <p className="text-sm mb-2" style={{ color: '#F8F8F8' }}>
                Get smokin&apos; deals & updates:
              </p>
              <form className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 rounded text-sm"
                  style={{
                    backgroundColor: 'rgba(30, 30, 30, 0.8)',
                    border: '1px solid rgba(255, 107, 53, 0.3)',
                    color: '#F8F8F8'
                  }}
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded font-semibold text-sm hover:opacity-90 transition-opacity"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B35, #D32F2F)',
                    color: '#F8F8F8'
                  }}
                >
                  Sign Up
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-8 pt-8 text-center"
          style={{
            borderTop: '1px solid rgba(255, 107, 53, 0.2)'
          }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-sm" style={{ color: '#999' }}>
              © {currentYear} Rise N&apos; Smoke Pit BBQ. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link
                href="/privacy"
                className="text-sm hover:opacity-80 transition-opacity"
                style={{ color: '#999' }}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm hover:opacity-80 transition-opacity"
                style={{ color: '#999' }}
              >
                Terms of Service
              </Link>
            </div>
          </div>
          <p className="text-xs mt-4" style={{ color: '#666' }}>
            Crafted with passion in Hillsboro, Texas 🔥
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;