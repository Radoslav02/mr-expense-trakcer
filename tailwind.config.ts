import type { Config } from 'tailwindcss';

const token = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: token('canvas'),
        surface: token('surface'),
        sunken: token('sunken'),
        line: token('line'),
        ink: {
          DEFAULT: token('ink'),
          muted: token('ink-muted'),
          subtle: token('ink-subtle'),
        },
        accent: {
          DEFAULT: token('accent'),
          hover: token('accent-hover'),
          soft: token('accent-soft'),
          ink: token('accent-ink'),
        },
        partner: {
          DEFAULT: token('partner'),
          soft: token('partner-soft'),
        },
        positive: token('positive'),
        warning: token('warning'),
        danger: {
          DEFAULT: token('danger'),
          soft: token('danger-soft'),
        },
      },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.04), 0 1px 1px rgb(0 0 0 / 0.02)',
        overlay: '0 16px 40px -12px rgb(0 0 0 / 0.22), 0 2px 6px rgb(0 0 0 / 0.06)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
