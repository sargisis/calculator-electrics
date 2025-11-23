/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        mesh: 'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.15), transparent 35%), radial-gradient(circle at 80% 0%, rgba(59,130,246,0.1), transparent 25%), radial-gradient(circle at 50% 80%, rgba(34,197,94,0.12), transparent 35%)',
      },
      boxShadow: {
        glass: '0 20px 45px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
};
