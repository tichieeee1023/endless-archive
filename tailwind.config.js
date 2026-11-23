export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0d0d12",
        panel: "#14141c",
        card: "#1a1a24",
        accent: "#4a3a7a",
        gold: "#ffd479",
      },
      fontFamily: {
        sans: ['"Pretendard Variable"', "Pretendard", "system-ui", "sans-serif"],
        serif: ['"Gowun Batang"', '"Nanum Myeongjo"', "serif"],
      },
    },
  },
  plugins: [],
};
