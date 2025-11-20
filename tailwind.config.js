/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./views/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional Neutral Scale (Zinc)
        'surface-50': '#FAFAFA',
        'surface-100': '#F4F4F5',
        'surface-200': '#E4E4E7',
        'surface-300': '#D4D4D8',
        'surface-800': '#27272A',
        'surface-900': '#18181B',
        'surface-950': '#09090B', // Deep Charcoal replacement

        // Brand Accent (Fluorescent Blue/Indigo)
        'brand-primary': '#4F46E5', // Indigo 600
        'brand-glow': '#818CF8',    // Indigo 400
        'brand-dark': '#3730A3',

        // Semantic
        'status-error': '#DC2626',
        'status-success': '#16A34A',

        // Platform colors (keep unchanged)
        'twitter': '#1DA1F2',
        'linkedin': '#0077B5',
        'instagram': '#E4405F',
        'tiktok': '#000000',
      },
      fontFamily: {
        // Use Inter for everything for consistency and sharpness
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'SF Mono', 'monospace'], // Tech-focused mono
      },
      backgroundImage: {
        'fluent-gradient': 'linear-gradient(135deg, #4F46E5 0%, #9333EA 50%, #EC4899 100%)',
        'photoreal-shine': 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)',
      },
      borderRadius: {
        'lg': '0.5rem',  // Sharp, standard
        'xl': '0.75rem', // Slightly softer
        '2xl': '1rem',   // Max roundness
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.03)',
        'sharp': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glow': '0 0 20px -5px rgba(79, 70, 229, 0.3)',
      },
      animation: {
        'gradient-xy': 'gradient-xy 6s ease infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
      },
      keyframes: {
        'gradient-xy': {
            '0%, 100%': {
                'background-size': '200% 200%',
                'background-position': 'left center'
            },
            '50%': {
                'background-size': '200% 200%',
                'background-position': 'right center'
            }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
