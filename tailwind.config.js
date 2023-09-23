/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    // Replaces all OOTB fonts
    fontFamily: {
      sans: "Roboto Mono, monospace",
    },
    // Extend keeps everything from tailwind but extends it.
    extend: {
      fontSize: {
        huge: ["80rem", { lineHeight: "1" }],
      },
      height: {
        // default height is 100vh (has problems on mobile browsers > user dvh)
        screen: "100dvh",
      },
      colors: {
        pizza: "#123456",
      },
    },
  },
  plugins: [],
};
