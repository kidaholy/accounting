import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hisabe financing",
  description: "Accounting System for Fixed Assets, VAT Declaration, and Stock Inventory",
  icons: {
    icon: "/images/hisabe logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`} data-gptw="">
        {children}
      </body>
    </html>
  );
}
