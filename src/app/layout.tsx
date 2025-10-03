import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify/unstyled";
import Providers from "@/components/Providers";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "Isinamuva Tutorials",
  description: "Learn the smart",
  icons: {
    icon: "/isinamuva-logo.jpg",
    shortcut: "/isinamuva-logo.jpg",
    apple: "/isinamuva-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* External Fonts and Styles */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600&family=Nunito:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.1/font/bootstrap-icons.css"
          rel="stylesheet"
        />
        <link href="/lib/animate/animate.min.css" rel="stylesheet" />
        <link
          href="/lib/owlcarousel/assets/owl.carousel.min.css"
          rel="stylesheet"
        />
        <link href="/css/bootstrap.min.css" rel="stylesheet" />
        <link href="/css/style.css" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <Navbar />
          {children}
          <ToastContainer position="top-right" theme="cyan" />
          <Footer />
        </Providers>
        {/* JavaScript Libraries */}
        <Script
          src="https://code.jquery.com/jquery-3.4.1.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js"
          strategy="beforeInteractive"
        />
        <Script src="/lib/wow/wow.min.js" strategy="afterInteractive" />
        <Script src="/lib/easing/easing.min.js" strategy="afterInteractive" />
        <Script src="/lib/waypoints/waypoints.min.js" strategy="afterInteractive" />
        <Script
          src="/lib/owlcarousel/owl.carousel.min.js"
          strategy="beforeInteractive"
        />
        <Script src="/js/main.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
