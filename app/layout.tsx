import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import CartModal from "@/components/cart/CartModal";

export const metadata: Metadata = {
  title: "Rise N' Smoke - Real Smoke. Real Deep. Real Good.",
  description: "Southern BBQ restaurant specializing in The Rise & Transform Method™. Located at 401 Abbott Avenue, Hillsboro Texas 76645.",
  keywords: "BBQ, barbecue, Hillsboro Texas, Rise N Smoke, smoked meat, restaurant",
  authors: [{ name: "Rise N' Smoke" }],
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "Rise N' Smoke BBQ",
    description: "Southern BBQ restaurant specializing in The Rise & Transform Method™",
    type: "website",
    locale: "en_US",
    url: "https://risensmoke.com",
    siteName: "Rise N' Smoke",
    images: [
      {
        url: '/risensmoke-logo.png',
        width: 800,
        height: 800,
        alt: "Rise N' Smoke BBQ Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="custom-scrollbar" style={{ fontFamily: "'Source Sans Pro', Arial, sans-serif", color: "#F8F8F8", backgroundColor: "#1C1C1C" }}>
        <Header />
        <CartModal />
        <main className="pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}