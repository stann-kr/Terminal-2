/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{app,components,libs,pages,hooks}/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'pixie': ['ProcrastinatingPixie', 'monospace'],
        'orbit': ['Orbit', 'monospace'],
        'mono': ['Orbit', 'var(--font-space-mono)', 'monospace'],
      },
      fontSize: {
        pico:    ['var(--text-pico)',    { lineHeight: '1.2' }],
        nano:    ['var(--text-nano)',    { lineHeight: '1.2' }],
        micro:   ['var(--text-micro)',   { lineHeight: '1.3' }],
        caption: ['var(--text-caption)', { lineHeight: '1.4' }],
        small:   ['var(--text-small)',   { lineHeight: '1.5' }],
        body:    ['var(--text-body)',    { lineHeight: '1.6' }],
        heading: ['var(--text-heading)', { lineHeight: '1.4' }],
        h2:      ['var(--text-h2)',      { lineHeight: '1.3' }],
        h1:      ['var(--text-h1)',      { lineHeight: '1.2' }],
        title:   ['var(--text-title)',   { lineHeight: '1.1' }],
        hero:    ['var(--text-hero)',    { lineHeight: '1' }],
        display: ['var(--text-display)', { lineHeight: '1' }],
      },
      colors: {
        'terminal': {
          'bg-base': 'rgb(var(--color-bg-base) / <alpha-value>)',
          'bg-panel': 'rgb(var(--color-bg-panel) / <alpha-value>)',
          'bg-panel-border': 'rgb(var(--color-bg-panel-border) / <alpha-value>)',
          'bg-overlay': 'rgb(var(--color-bg-overlay) / <alpha-value>)',
          'primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
          'subdued': 'rgb(var(--color-text-subdued) / <alpha-value>)',
          'muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
          /* Semantic Accents */
          'accent-primary': 'rgb(var(--color-accent-primary) / <alpha-value>)',
          'accent-secondary': 'rgb(var(--color-accent-secondary) / <alpha-value>)',
          'accent-tertiary': 'rgb(var(--color-accent-tertiary) / <alpha-value>)',
          'accent-alert': 'rgb(var(--color-accent-alert) / <alpha-value>)',
          'accent-warn': 'rgb(var(--color-accent-warn) / <alpha-value>)',
        }
      }
    },
  },
  plugins: [],
}

