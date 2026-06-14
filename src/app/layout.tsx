import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "RepasseCheck",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RepasseCheck"
  },
  title: "RepasseCheck | Conciliação inteligente para e-commerce",
  description:
    "RepasseCheck é uma plataforma de conciliação de recebimentos para e-commerce com importação CSV, integrações por login e relatórios automáticos.",
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: [
      { sizes: "192x192", type: "image/png", url: "/icons/icon-192.png" },
      { sizes: "512x512", type: "image/png", url: "/icons/icon-512.png" }
    ],
    shortcut: "/icons/icon-192.png"
  },
  manifest: "/manifest.webmanifest",
  metadataBase: new URL("https://repassecheck.vercel.app"),
  openGraph: {
    title: "RepasseCheck",
    description: "Conciliação inteligente para recebimentos de e-commerce.",
    type: "website",
    locale: "pt_BR"
  }
};

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: "#050816",
  viewportFit: "cover",
  width: "device-width"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
