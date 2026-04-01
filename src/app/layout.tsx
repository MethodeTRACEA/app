import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRACÉA · Régulation émotionnelle structurée",
  description:
    "Entraînement à la stabilité émotionnelle par la récupération physiologique",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/images/tracea-favicon.ico" sizes="any" />
        <link rel="icon" href="/images/tracea-favicon-32.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/images/tracea-favicon-64.png" sizes="64x64" type="image/png" />
        <link rel="apple-touch-icon" href="/images/tracea-apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
