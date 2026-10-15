/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vermelho vibrante / Coral carmesim extraído da logo Casa Jane
        primary: {
          50: '#fff1f3',
          100: '#ffe4e8',
          200: '#fecdd6',
          300: '#fda4b5',
          400: '#fb718d',
          500: '#f43f68',
          600: '#d62744', // Tom principal da logo
          700: '#b81c37',
          800: '#96172d',
          900: '#7a1426',
          950: '#460612',
        },
        // Roxo / Ameixa nobre extraído da base da logo
        plum: {
          50: '#faf4f9',
          100: '#f3e8f2',
          200: '#e8d2e6',
          300: '#d5b0d2',
          400: '#bc86b6',
          500: '#9d5f97',
          600: '#81467a',
          700: '#681a5d', // Tom roxo da mão/base da logo
          800: '#55154c',
          900: '#3e0e37',
          950: '#260622',
        },
        // Grafite elegante do texto "CASA JANE"
        charcoal: {
          50: '#f7f7f8',
          100: '#eeeef0',
          200: '#dddee1',
          300: '#b9bbc0',
          400: '#8e9198',
          500: '#6b6e75',
          600: '#54565c',
          700: '#424448',
          800: '#2e3033', // Tom grafite do texto da logo
          900: '#1e2022',
          950: '#121314',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #681a5d 0%, #a31c51 50%, #d62744 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #55154c 0%, #8c1744 50%, #b81c37 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(104,26,93,0.06) 0%, rgba(214,39,68,0.08) 100%)',
        'brand-gradient-radial': 'radial-gradient(circle at top right, #d62744 0%, #681a5d 100%)',
      }
    },
  },
  plugins: [],
}
