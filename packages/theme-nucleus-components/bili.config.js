module.exports = {
  input: 'src/index.ts',
  banner: true,
  output: {
    format: ['cjs', 'esm'],
    extractCSS: false,
  },
  plugins: {
    typescript2: {
      tsconfigOverride: {
        include: ['src']
      }
    },
    vue: {
      css: true
    }
  }
};
