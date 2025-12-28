"use client";
import { useState, useEffect } from "react";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";
import EmailVerificationBanner from "@/components/Common/EmailVerificationBanner";

import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="vi" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning={true}>
        {!mounted || loading ? (
          <PreLoader />
        ) : (
          <>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <AuthProvider>
                <CartProvider>
                  <ReduxProvider>
                    <CartModalProvider>
                      <ModalProvider>
                        <PreviewSliderProvider>
                          <EmailVerificationBanner />
                          <Header />
                          {children}

                        <QuickViewModal />
                        <CartSidebarModal />
                        <PreviewSliderModal />
                      </PreviewSliderProvider>
                    </ModalProvider>
                  </CartModalProvider>
                </ReduxProvider>
              </CartProvider>
            </AuthProvider>
            </GoogleOAuthProvider>
            <ScrollToTop />
            <Footer />
          </>
        )}
      </body>
    </html>
  );
}