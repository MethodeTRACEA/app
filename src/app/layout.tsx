import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRACÉA · Régulation émotionnelle structurée",
  description: "Outil de régulation émotionnelle en temps réel",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "TRACÉA",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/images/tracea-apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#C4704A",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
