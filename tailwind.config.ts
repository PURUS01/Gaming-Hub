import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gaming-dark': '#0a0a0f',
        'gaming-darker': '#050508',
        'gaming-purple': '#8b5cf6',
        'gaming-blue': '#3b82f6',
        'gaming-green': '#10b981',
      },
    },
  },
  plugins: [],
}
export default config
