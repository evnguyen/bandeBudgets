// import "./globals.css";
// import '@tamagui/core/reset.css';
// import { NextTamaguiProvider } from '../components/NextTamaguiProvider';
import { adminAuth } from '../../firebaseAdmin';
import { cookies } from 'next/headers';
import ThemeProviderWrapper from '../components/ThemeProviderWrapper';
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
        <ThemeProviderWrapper>
          <div className="rootContainer">
            {/* {showSideBar && <SidebarNavigation />} */}
            <div className="content">{children}</div>
          </div>
        </ThemeProviderWrapper>
        {/* </NextTamaguiProvider> */}
      </body>
    </html>
  );
}
