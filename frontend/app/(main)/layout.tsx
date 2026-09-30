import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Pumpkins Cafe",
  description: "QR Menu System",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="main-site">
        {children}
      </body>
    </html>
  );
}