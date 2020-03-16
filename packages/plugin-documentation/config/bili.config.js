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
        {
          src: path.resolve(__dirname, '../src/index.template.html'),
          dest: path.resolve(__dirname, '../dist'),
        },
        {
          src: path.resolve(__dirname, '../src/assets'),
          dest: path.resolve(__dirname, '../dist'),
        }
      ],
    }
  }
};
