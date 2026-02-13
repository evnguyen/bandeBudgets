"use client";
// import { Roboto } from 'next/font/google';
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "class",
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#56b53f",
        },
        secondary: {
          main: "#3C4F76",
        },
        background: {
          default: "#F5F5F5",
          paper: "#fff",
        },
      },
      components: {
        MuiDataGrid: {
          styleOverrides: {
            columnHeader: {
              backgroundColor: "#fff",
            },
            overlay: {
              backgroundColor: "#fff",
            },
          },
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#56b53f",
        },
        secondary: {
          main: "#3C4F76",
        },
      },
      components: {
        MuiDataGrid: {
          styleOverrides: {
            columnHeader: {
              backgroundColor: "#121212",
            },
            overlay: {
              backgroundColor: "#121212",
            },
          },
        },
      },
    },
  },
  // typography: {
  //   fontFamily: roboto.style.fontFamily,
  // },
});

export default theme;
