import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f97316',
        dark: '#1e293b',
        darker: '#0f172a',
      },
    },
  },
  plugins: [],
}
export default config