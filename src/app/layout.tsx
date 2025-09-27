import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Rise N' Smoke - Real Smoke. Real Deep. Real Good.",
  description: "Southern BBQ restaurant specializing in The Rise & Transform Method™. Located at 401 Abbott Avenue, Hillsboro Texas 76645.",
  keywords: "BBQ, barbecue, Hillsboro Texas, Rise N Smoke, smoked meat, restaurant",
  authors: [{ name: "Rise N' Smoke" }],
  openGraph: {
    title: "Rise N' Smoke BBQ",
    description: "Southern BBQ restaurant specializing in The Rise & Transform Method™",
    type: "website",
    locale: "en_US",
    url: "https://risensmoke.com",
    siteName: "Rise N' Smoke",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-body text-smoke-black bg-smoke-white custom-scrollbar">
        <Header />
        <main className="pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}