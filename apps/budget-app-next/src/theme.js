'use client';
// import { Roboto } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#56b53f',
        },
        secondary: {
          main: '#3C4F76',
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#56b53f',
        },
        secondary: {
          main: '#3C4F76',
        },
      },
    },
  },
  // typography: {
  //   fontFamily: roboto.style.fontFamily,
  // },
});

export default theme;
