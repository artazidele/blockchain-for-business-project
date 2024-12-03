/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    colors: {
      'coffee_1': '#ece0d1',
      'coffee_2': '#dbc1ac',
      'coffee_3': '#967259',
      'coffee_4': '#634832',
      'coffee_5': '#38220f',
      'ocean_1': '#c1f2fe',
      // 'ocean_2': '#007c9b',
      'ocean_2': '#38220f',
      'ocean_3': '#38220f',
      // 'ocean_3': '#002d39',
      // 'ocean_4': '#d9f99d',
      'ocean_4': '#ece0d1',
      'white': '#ffffff',
      'lime-900': '#365314',
      'red-900': '#7f1d1d',
    }
  },
  plugins: [],
};
