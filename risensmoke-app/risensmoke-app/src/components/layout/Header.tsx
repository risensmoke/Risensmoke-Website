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
    { name: "The SmokeMaster", href: "/about" },
    { name: "Contact", href: "/contact" }
  ];

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="logo">
            <Image
              src="/risensmoke-logo.png"
              alt="Rise N' Smoke BBQ Logo"
              width={60}
              height={60}
              className="rounded-full w-12 h-12 md:w-15 md:h-15"
              style={{ backgroundColor: 'transparent', mixBlendMode: 'normal' }}
              priority
            />
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
          <div className="md:hidden mobile-menu">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-3 nav-link text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ borderBottom: '1px solid rgba(255, 107, 53, 0.2)' }}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/order"
              className="btn-primary mt-4 block text-center"
              onClick={() => setIsMobileMenuOpen(false)}
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