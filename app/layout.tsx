import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// იმპორტები: styles ფოლდერი layout.tsx-თან ერთად არის app-ში
import "./styles/bootstrap.css";
import "./styles/font-awesome.min.css";
import "./styles/style.css";
import "./styles/responsive.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = { 
  title: "Feane - Restaurant", 
  description: "Delicious Food Delivered to You" 
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka">
      <head>
        <link rel="shortcut icon" href="/images/favicon.png" type="image/x-icon" />
        {/* გარე ბიბლიოთეკების CSS (CDN) */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery-nice-select/1.1.0/css/nice-select.min.css" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} sub_page`}>
        
        {children}

        {/* 1. jQuery იტვირთება პირველი - აუცილებელია Bootstrap-ისთვის და სხვებისთვის */}
        <Script src="https://code.jquery.com/jquery-3.4.1.min.js" strategy="beforeInteractive" />
        
        {/* 2. Google Maps API - აუცილებელია BookSection-ის რუკისთვის */}
        {/* შენიშვნა: იმისთვის რომ რუკა გამოჩნდეს, 'YOUR_API_KEY' უნდა ჩაანაცვლო რეალური გასაღებით */}
            <Script 
            src="https://maps.googleapis.com/maps/api/js?key=აქ_ჩასვი_შენი_გასაღები&callback=myMap" 
              strategy="lazyOnload" 
               />

        {/* 3. ბიბლიოთეკები, რომლებიც jQuery-ს საჭიროებენ */}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-nice-select/1.1.0/js/jquery.nice-select.min.js" strategy="lazyOnload" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js" strategy="lazyOnload" />
        <Script src="https://unpkg.com/isotope-layout@3.0.6/dist/isotope.pkgd.min.js" strategy="lazyOnload" />
        
        {/* 4. Bootstrap და შენი ლოკალური სკრიპტები */}
        <Script src="/js/bootstrap.js" strategy="lazyOnload" />
        <Script src="/js/custom.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}