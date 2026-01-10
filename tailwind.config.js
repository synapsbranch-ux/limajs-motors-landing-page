/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // Couleurs principales du brand
          'primary': {
            DEFAULT: '#FF6B00',
            light: '#FF8533',
            dark: '#CC5500'
          },
          'secondary': {
            DEFAULT: '#4169E1',
            light: '#668CE6',
            dark: '#2B4B9E'
          },
          'accent': {
            DEFAULT: '#FFD700',
            light: '#FFE033',
            dark: '#CCAC00'
          },
          // Couleurs de fond
          'background': {
            light: '#FFFFFF',
            DEFAULT: '#F5F5F5',
            dark: '#333333'
          },
          // Couleurs de texte
          'text': {
            primary: '#333333',
            secondary: '#666666',
            tertiary: '#999999',
            light: '#FFFFFF'
          }
        },
        // Configuration des breakpoints pour le responsive
        screens: {
          'xs': '320px',
          'sm': '480px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1280px',
          '2xl': '1536px',
        },
        // Configuration de la typographie
        fontFamily: {
          'sans': ['Inter', 'system-ui', 'sans-serif'],
          'heading': ['Inter', 'sans-serif'],
        },
        // Tailles de police responsives
        fontSize: {
          'xs': ['0.75rem', { lineHeight: '1rem' }],
          'sm': ['0.875rem', { lineHeight: '1.25rem' }],
          'base': ['1rem', { lineHeight: '1.5rem' }],
          'lg': ['1.125rem', { lineHeight: '1.75rem' }],
          'xl': ['1.25rem', { lineHeight: '1.75rem' }],
          '2xl': ['1.5rem', { lineHeight: '2rem' }],
          '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
          '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
          '5xl': ['3rem', { lineHeight: '1.2' }],
          '6xl': ['3.75rem', { lineHeight: '1.1' }],
        },
        // Configuration des espaces et marges
        spacing: {
          '72': '18rem',
          '84': '21rem',
          '96': '24rem',
          '128': '32rem',
        },
        // Configuration des bordures
        borderRadius: {
          'sm': '0.125rem',
          DEFAULT: '0.25rem',
          'md': '0.375rem',
          'lg': '0.5rem',
          'xl': '0.75rem',
          '2xl': '1rem',
          'full': '9999px',
        },
        // Configuration des ombres
        boxShadow: {
          'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
          'none': 'none',
          // Ombres personnalisées pour les cartes et éléments
          'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
          'card-hover': '0 10px 30px rgba(0, 0, 0, 0.12)',
          'button': '0 4px 12px rgba(255, 107, 0, 0.3)',
        },
        // Configuration des animations
        animation: {
          'fade-in': 'fadeIn 0.5s ease-in',
          'slide-in': 'slideIn 0.5s ease-in',
          'slide-up': 'slideUp 0.6s ease-out',
          'bounce-slow': 'bounce 3s infinite',
          'float': 'float 6s ease-in-out infinite',
          'spin-slow': 'spin 6s linear infinite',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideIn: {
            '0%': { transform: 'translateX(-20px)', opacity: '0' },
            '100%': { transform: 'translateX(0)', opacity: '1' },
          },
          slideUp: {
            '0%': { transform: 'translateY(20px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
          float: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
          },
        },
        // Configuration des transitions
        transitionDuration: {
          '0': '0ms',
          '2000': '2000ms',
          '3000': '3000ms',
        },
        transitionTimingFunction: {
          'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
          'springy': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        },
        // Configuration de la grille
        gridTemplateColumns: {
          'auto-fit': 'repeat(auto-fit, minmax(250px, 1fr))',
          'auto-fill': 'repeat(auto-fill, minmax(250px, 1fr))',
        },
        // Configuration des conteneurs
        container: {
          center: true,
          padding: {
            DEFAULT: '1rem',
            sm: '2rem',
            lg: '4rem',
            xl: '5rem',
            '2xl': '6rem',
          },
        },
        // Support d'aspect ratio
        aspectRatio: {
          'auto': 'auto',
          '1/1': '1 / 1',
          '4/3': '4 / 3',
          '16/9': '16 / 9',
          '21/9': '21 / 9',
        },
        // Configuration pour les textes tronqués
        lineClamp: {
          7: '7',
          8: '8',
          9: '9',
          10: '10',
        },
        // Z-index étendus
        zIndex: {
          '-10': '-10',
          '60': '60',
          '70': '70',
          '80': '80',
          '90': '90',
          '100': '100',
        },
        // Backdrop filters
        backdropBlur: {
          xs: '2px',
          '2xl': '40px',
          '3xl': '60px',
        },
      },
    },
    // Variants personnalisés
    variants: {
      extend: {
        backgroundColor: ['active', 'group-hover'],
        textColor: ['active', 'group-hover'],
        borderColor: ['active', 'focus-visible'],
        opacity: ['disabled'],
        scale: ['group-hover'],
        translate: ['group-hover'],
      },
    },
    // Plugins
    plugins: [
      // Ajoutez ici vos plugins Tailwind si nécessaire
    ],
    // Mode sombre
    darkMode: 'class',
  }