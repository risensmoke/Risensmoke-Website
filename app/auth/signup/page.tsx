'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, Loader2, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.firstName || !formData.lastName) {
      return 'First and last name are required';
    }
    if (!formData.email) {
      return 'Email is required';
    }
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Create account
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Auto sign in after successful registration
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Account created but sign in failed - redirect to login
        router.push('/auth/login?message=Account created. Please sign in.');
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const pw = formData.password;
    if (pw.length === 0) return null;
    if (pw.length < 8) return { label: 'Too short', color: '#D32F2F' };
    if (pw.length < 12) return { label: 'Good', color: '#FF6B35' };
    return { label: 'Strong', color: '#4CAF50' };
  };

  const strength = passwordStrength();

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-h1 text-fire-gradient mb-2">Create Account</h1>
        <p style={{ color: '#F8F8F8' }}>Join Rise N&apos; Smoke BBQ</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(211, 47, 47, 0.2)', border: '1px solid #D32F2F' }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
              <span style={{ color: '#F8F8F8' }}>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-2" style={{ color: '#F8F8F8' }}>
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#888' }} />
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-white"
                  style={{
                    backgroundColor: '#2A2A2A',
                    border: '1px solid #444',
                    outline: 'none',
                  }}
                  placeholder="John"
                />
              </div>
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-2" style={{ color: '#F8F8F8' }}>
                Last Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg text-white"
                  style={{
                    backgroundColor: '#2A2A2A',
                    border: '1px solid #444',
                    outline: 'none',
                  }}
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#F8F8F8' }}>
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#888' }} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg text-white"
                style={{
                  backgroundColor: '#2A2A2A',
                  border: '1px solid #444',
                  outline: 'none',
                }}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2" style={{ color: '#F8F8F8' }}>
              Phone Number <span style={{ color: '#888' }}>(optional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#888' }} />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-white"
                style={{
                  backgroundColor: '#2A2A2A',
                  border: '1px solid #444',
                  outline: 'none',
                }}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#F8F8F8' }}>
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#888' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-12 py-3 rounded-lg text-white"
                style={{
                  backgroundColor: '#2A2A2A',
                  border: '1px solid #444',
                  outline: 'none',
                }}
                placeholder="Min 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: '#888' }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {strength && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: '#2A2A2A' }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: strength.label === 'Too short' ? '33%' : strength.label === 'Good' ? '66%' : '100%',
                      backgroundColor: strength.color,
                    }}
                  />
                </div>
                <span className="text-xs" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: '#F8F8F8' }}>
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#888' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-12 py-3 rounded-lg text-white"
                style={{
                  backgroundColor: '#2A2A2A',
                  border: '1px solid #444',
                  outline: 'none',
                }}
                placeholder="Confirm your password"
              />
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              backgroundColor: isLoading ? '#888' : '#FF6B35',
              color: '#FFF',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p style={{ color: '#888' }}>
            Already have an account?{' '}
            <Link
              href={`/auth/login${callbackUrl !== '/' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
              className="font-semibold hover:underline"
              style={{ color: '#FF6B35' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm hover:underline" style={{ color: '#888' }}>
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#121212' }}>
      <Suspense fallback={
        <div className="w-full max-w-md flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#FF6B35' }} />
        </div>
      }>
        <SignupForm />
      </Suspense>
    </div>
  );
}
