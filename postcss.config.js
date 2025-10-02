module.exports = {
  // Provide a default `from` so plugins that call postcss.parse don't trigger warnings
  from: undefined,
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}