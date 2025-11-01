'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CartButton from '@/components/cart/CartButton';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Order", href: "/order" },
    { name: "Ship Nationwide", href: "/ship" },
    { name: "The SmokeMaster", href: "/smokemaster" },
    { name: "Contact", href: "/contact" }
  ];

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="logo flex-shrink-0">
            <div className="w-12 h-12 md:w-14 md:h-14 relative">
              <Image
                src="/Assets/Logo/Logo_RiseNSmoke.svg"
                alt="Rise N' Smoke BBQ Logo"
                fill
                className="object-contain"
                style={{
                  backgroundColor: 'transparent',
                  mixBlendMode: 'normal'
                }}
                sizes="(max-width: 768px) 48px, 56px"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className="nav-link">
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center" style={{ gap: '0.75rem' }}>
            <CartButton />
            <Link href="/order" className="hidden md:block btn-primary">
              Order Online
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              style={{
                color: "#F8F8F8",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <Menu className="w-7 h-7" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden mobile-menu"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: '#2a2a2a',
              borderBottom: '2px solid #FF6B35',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.9)',
              padding: '1rem',
              zIndex: 99999
            }}
          >
            {navItems.map((item, index) => (
              <Link
                key={item.name}
                href={item.href}
                className="nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.75rem 0',
                  fontSize: '1.125rem',
                  borderBottom: index < navItems.length - 1 ? '1px solid rgba(255, 107, 53, 0.2)' : 'none',
                  textDecoration: 'none',
                  color: '#F8F8F8'
                }}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/order"
              className="btn-primary"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'block',
                marginTop: '1rem',
                textAlign: 'center',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem'
              }}
            >
              Order Online
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;