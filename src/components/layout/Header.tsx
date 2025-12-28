'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CartButton from '@/components/cart/CartButton';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
    { name: "Order", href: "/order" },
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

            {/* User Menu / Sign In */}
            <div className="hidden md:block relative" ref={userMenuRef}>
              {session?.user ? (
                <>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                    style={{ backgroundColor: isUserMenuOpen ? '#2A2A2A' : 'transparent' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#FF6B35' }}
                    >
                      <span className="text-white font-semibold text-sm">
                        {session.user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                      style={{ color: '#888' }}
                    />
                  </button>
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg overflow-hidden"
                      style={{ backgroundColor: '#2A2A2A', border: '1px solid #444' }}
                    >
                      <div className="px-4 py-3" style={{ borderBottom: '1px solid #444' }}>
                        <p className="text-sm font-medium" style={{ color: '#F8F8F8' }}>
                          {session.user.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: '#888' }}>
                          {session.user.email}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          console.log('[SignOut] Button clicked at:', new Date().toISOString());
                          setIsUserMenuOpen(false);
                          try {
                            // Use redirect: false to prevent NextAuth from using NEXTAUTH_URL
                            await signOut({ redirect: false });
                            // Manually redirect to current origin
                            window.location.href = window.location.origin;
                          } catch (error) {
                            console.error('[SignOut] Error:', error);
                          }
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-black/20 transition-colors"
                        style={{ color: '#F8F8F8' }}
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105"
                  style={{
                    color: '#F8F8F8',
                    backgroundColor: 'rgba(255, 107, 53, 0.15)',
                    border: '1px solid rgba(255, 107, 53, 0.4)'
                  }}
                >
                  <User className="w-5 h-5" style={{ color: '#FF6B35' }} />
                  <span className="font-medium">Sign In</span>
                </Link>
              )}
            </div>

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

            {/* Mobile Auth Section */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 107, 53, 0.2)' }}>
              {session?.user ? (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#FF6B35' }}
                    >
                      <span className="text-white font-semibold">
                        {session.user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: '#F8F8F8' }}>
                        {session.user.name}
                      </p>
                      <p className="text-sm" style={{ color: '#888' }}>
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      console.log('[SignOut Mobile] Button clicked');
                      setIsMobileMenuOpen(false);
                      try {
                        await signOut({ redirect: false });
                        window.location.href = window.location.origin;
                      } catch (error) {
                        console.error('[SignOut Mobile] Error:', error);
                      }
                    }}
                    className="flex items-center gap-2 w-full py-2"
                    style={{ color: '#F8F8F8' }}
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2"
                  style={{ color: '#F8F8F8' }}
                >
                  <User className="w-5 h-5" />
                  Sign In / Create Account
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;