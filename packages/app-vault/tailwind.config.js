module.exports = {
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
  purge: ["./src/**/*.tsx"],
};
