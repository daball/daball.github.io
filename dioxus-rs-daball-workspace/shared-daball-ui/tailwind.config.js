import path from 'node:path';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, 'src'),
  ],
  theme: {
    extend: {
      colors: {
        // Brand aliases point to CSS vars
        primary: 'var(--brand-primary)',
        danger: 'var(--brand-danger)',
        success: 'var(--brand-success)',
        
        // Material scales for granular control
        material: {
          red: {
            400: 'var(--material-red-400)',
            500: 'var(--material-red-500)',
            700: 'var(--material-red-700)',
            900: 'var(--material-red-900)',
            a400: 'var(--material-red-a400)',
          },
          green: {
            500: 'var(--material-green-500)',
            800: 'var(--material-green-800)',
          },
        },
        
        // Semantic
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        bg: {
          dark: 'var(--bg-dark)',
          darker: 'var(--bg-darker)',
          darkest: 'var(--bg-darkest)',
        }
      }
    }
  }
}
