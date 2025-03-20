// import "./globals.css";
// import '@tamagui/core/reset.css';
// import { NextTamaguiProvider } from '../components/NextTamaguiProvider';
import { adminAuth } from '../../firebaseAdmin';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { cookies } from 'next/headers';
import theme from '@/theme';
import './globals.css';

export default async function RootLayout({ children }) {
  let showSideBar = false;
  const token = cookies().get('firebase_token');
  try {
    await adminAuth.verifyIdToken(token?.value || '');
    showSideBar = true;
  } catch (error) {
    console.error(error);
  }

  return (
    <html lang="en">
      <body>
        {/* <NextTamaguiProvider> */}
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <div className="rootContainer">
              {/* {showSideBar && <SidebarNavigation />} */}
              <CssBaseline />
              <div className="content">{children}</div>
            </div>
          </ThemeProvider>
        </AppRouterCacheProvider>
        {/* </NextTamaguiProvider> */}
      </body>
    </html>
  );
}
