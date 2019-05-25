const path = require("path");

module.exports = {
  input: path.resolve(__dirname, '../src/index.ts'),
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
    },
    copy: {
      targets: [
        path.resolve(__dirname, '../src/index.template.html')
      ],
      outputFolder: path.resolve(__dirname, '../dist')
    }
  }
};
