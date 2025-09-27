import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'smoke-black': '#1C1C1C',
        'ember-orange': '#FF6B35',
        'fire-red': '#D32F2F',
        'ash-gray': '#6C6C6C',
        'smoke-white': '#F8F8F8',
        'hickory-brown': '#8B4513',
        'light-background': '#F5F5F5',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(to top, #D32F2F, #FF6B35, #FFB74D)',
        'fire-gradient': 'linear-gradient(to top, #B71C1C, #D32F2F, #FF5722, #FF6B35, #FF9800, #FFC107)',
        'smoke-gradient': 'linear-gradient(to top, #1C1C1C, #424242, #6C6C6C, #9E9E9E, #C0C0C0)',
        'background-gradient': 'linear-gradient(to bottom, #6C6C6C, #1C1C1C)',
      },
      fontFamily: {
        'primary': ['Rye', 'serif'],
        'secondary': ['Alfa Slab One', 'serif'],
        'body': ['Source Sans Pro', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'hero': 'clamp(4rem, 12vw, 8rem)',
        'h1': 'clamp(2rem, 5vw, 3.5rem)',
        'h2': 'clamp(1.5rem, 4vw, 2.5rem)',
        'h3': 'clamp(1.25rem, 3vw, 2rem)',
        'h4': 'clamp(1.125rem, 2.5vw, 1.5rem)',
        'large': '1.25rem',
        'base': '1rem',
        'small': '0.875rem',
      },
      animation: {
        'smoke-rise': 'smokeRise 4s ease-in-out infinite',
        'fire-flicker': 'fireFlicker 2s ease-in-out infinite',
      },
      keyframes: {
        smokeRise: {
          '0%': { transform: 'translateY(100%) scale(0)', opacity: '0' },
          '25%': { opacity: '0.3' },
          '50%': { opacity: '0.2' },
          '100%': { transform: 'translateY(-200%) scale(1.5)', opacity: '0' },
        },
        fireFlicker: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};

export default config;