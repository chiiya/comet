const { colors } = require('tailwindcss/defaultTheme');

module.exports = {
  theme: {
    // fontFamily: {
    //   sans: [
    //     '-apple-system',
    //     'BlinkMacSystemFont',
    //     '"Segoe UI"',
    //     'Roboto',
    //     'Oxygen',
    //     'Ubuntu',
    //     'Cantarell',
    //     'Open Sans',
    //     '"Helvetica Neue"',
    //     'Arial',
    //     '"Noto Sans"',
    //     'sans-serif',
    //     '"Apple Color Emoji"',
    //     '"Segoe UI Emoji"',
    //     '"Segoe UI Symbol"',
    //     '"Noto Color Emoji"',
    //   ],
    // },
    extend: {
      colors: {
        gray: {
          ...colors.gray,
          '100': '#f8fafc',
          '750': '#738a94',
          '850': '#1e2936',
          '950': '#2a3644',
        },
        blue: {
          ...colors.blue,
          '600': '#3273dc',
          '950': '#003c57',
        }

      },
      minWidth: {
        'xs': '20rem',
      },
      inset: {
        '96': '24rem',
      },
      width: {
        '80': '20rem',
      },
      height: {
        '96': '24rem',
      },
      boxShadow: {
        // content: '0 0 5px rgba(0, 0, 0, .02), 0 -5px 22px -8px rgba(0, 0, 0, .1)',
        content: '0 0 5px rgba(0, 0, 0, .02), 0 50px 22px -8px rgba(0, 0, 0, .1)',
        operation: '0 0 5px rgba(0, 0, 0, .02), 0 50px 22px -8px rgba(0, 0, 0, .1)',
      }
    }
  },
  variants: {
    // Some useful comment
  },
  plugins: [
    require('@tailwindcss/custom-forms'),
  ]
};
