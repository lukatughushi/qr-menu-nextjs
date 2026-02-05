import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// სტილების იმპორტი - დარწმუნდი, რომ გზა სწორია
import "./styles/bootstrap.css";
import "./styles/font-awesome.min.css";
import "./styles/style.css";
import "./styles/responsive.css";

import { CartProvider } from "../context/CartContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = { 
  title: "Pumpkin Café", 
  description: "Pumpkins Café is a cozy and inspiring space..." 
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka">
      <head>
        <link rel="shortcut icon" href="/images/favicon.png" type="image/x-icon" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery-nice-select/1.1.0/css/nice-select.min.css" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} sub_page`}>
        
        {/* CartProvider ფარავს მთელ აპლიკაციას მონაცემების გაზიარებისთვის */}
        <CartProvider>
          {children}
        </CartProvider>

        {/* 1. JQuery - აუცილებელია ყველაზე ადრე */}
        <Script src="https://code.jquery.com/jquery-3.4.1.min.js" strategy="beforeInteractive" />
        
        {/* 2. Isotope - ფილტრაციის ბიბლიოთეკა (თუ React-ის ძებნა გაჭედავს, ამის ბრალი იქნება) */}
        <Script src="https://unpkg.com/isotope-layout@3.0.6/dist/isotope.pkgd.min.js" strategy="lazyOnload" />
        
        {/* 3. დანარჩენი ბიბლიოთეკები */}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-nice-select/1.1.0/js/jquery.nice-select.min.js" strategy="lazyOnload" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js" strategy="lazyOnload" />
        
        <Script src="/js/bootstrap.js" strategy="lazyOnload" />
        
        {/* 4. custom.js - ბოლოში, რომ ყველაფერი ჩატვირთული დახვდეს */}
        <Script src="/js/custom.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}