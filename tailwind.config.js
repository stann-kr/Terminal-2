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
      colors: {
        'terminal': {
          'bg-base': 'rgb(var(--color-bg-base) / <alpha-value>)',
          'bg-panel': 'rgb(var(--color-bg-panel) / <alpha-value>)',
          'bg-panel-border': 'rgb(var(--color-bg-panel-border) / <alpha-value>)',
          'primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
          'subdued': 'rgb(var(--color-text-subdued) / <alpha-value>)',
          'muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
          'accent-amber': 'rgb(var(--color-accent-amber) / <alpha-value>)',
          'accent-cyan': 'rgb(var(--color-accent-cyan) / <alpha-value>)',
          'accent-hot': 'rgb(var(--color-accent-hot) / <alpha-value>)',
          'accent-gold': 'rgb(var(--color-accent-gold) / <alpha-value>)',
          'accent-purple': 'rgb(var(--color-accent-purple) / <alpha-value>)',
          'accent-warn': 'rgb(var(--color-accent-warn) / <alpha-value>)',
        }
      }
    },
  },
  plugins: [],
}

