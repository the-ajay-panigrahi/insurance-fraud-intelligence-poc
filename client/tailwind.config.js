const neutral = {
  50: "#000000",
  100: "#1f1f1f",
  200: "#353535",
  300: "#555555",
  400: "#a3a3a3",
  500: "#b8b8b8",
  600: "#d0d0d0",
  700: "#e5e5e5",
  800: "#f3f3f3",
  900: "#ffffff",
  950: "#ffffff",
};

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Existing risk/status classes keep their labels and icons in the monochrome theme.
      colors: {
        slate: neutral,
        rose: neutral,
        red: neutral,
        blue: neutral,
        indigo: neutral,
        purple: neutral,
        teal: neutral,
        emerald: neutral,
        amber: neutral,
      },
    },
  },
  plugins: [],
};
