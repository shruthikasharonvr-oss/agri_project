import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarDynamic from "./components/NavbarDynamic";
import ProfileSync from "./components/ProfileSync";
import { TranslationProvider } from "./contexts/TranslationContext";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import AgriAssistant from "./components/AgriAssistant";
import LoginNagModal from "./components/LoginNagModal";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FarmToHome",
  description: "Fresh produce directly from farmers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Translate */}
        <Script
          dangerouslySetInnerHTML={{
            __html: `
            function googleTranslateElementInit() {
              if (window.google && window.google.translate) {
                new google.translate.TranslateElement({pageLanguage: 'en', autoDisplay: false}, 'google_translate_element');
              }
            }
            window.changeLanguage = function(lang) {
              var combo = document.querySelector('.goog-te-combo');
              if (combo) {combo.value = lang; combo.dispatchEvent(new Event('change', {bubbles: true}));}
            };
            `
          }}
        />
        <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />

        {/* Model Viewer for 3D models */}
        <Script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
          strategy="afterInteractive"
        />

        {/* CSS for Google Translate Widget */}
        <style>{`
          .goog-te-banner {
            display: none !important;
          }
          
          #google_translate_element {
            position: relative;
            z-index: 40;
          }
          
          .goog-te-combo {
            background-color: transparent;
            border: 1px solid #10b981;
            color: #10b981;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .goog-te-combo:hover {
            background-color: rgba(16, 185, 129, 0.1);
            border-color: #059669;
          }
          
          .goog-te-menu-frame {
            max-height: 300px !important;
          }
          
          body.translated {
            /* Ensure translated content displays properly */
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* Hidden Google Translate Element - MUST be in body for Google Translate to initialize */}
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        
        <AuthProvider>
          <TranslationProvider>
            <CartProvider>
              <ProfileSync />
              <NavbarDynamic />
              <AgriAssistant />
              <LoginNagModal />
              {children}
            </CartProvider>
          </TranslationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}