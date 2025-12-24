/**
 * NextAuth.js Configuration
 * Handles authentication with credentials (email/password)
 * Uses Supabase for data storage
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/signup',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[Auth] authorize() called at:', new Date().toISOString());

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        console.time('[Auth] Supabase query');
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();
        console.timeEnd('[Auth] Supabase query');

        if (error || !user) {
          console.log('[Auth] User not found:', email);
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
          console.log('[Auth] Invalid password for:', email);
          return null;
        }

        console.log('[Auth] User authenticated:', user.email);

        return {
          id: user.id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          phone: user.phone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = (user as { phone?: string | null }).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { phone?: string | null }).phone = token.phone as string | null;
      }
      return session;
    },
  },
});
