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
              className="rounded-full"
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
          <div className="flex items-center space-x-4">
            <CartButton />
            <Link href="/order" className="hidden md:block btn-primary">
              Order Online
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              style={{ color: "#F8F8F8" }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-2 nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
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