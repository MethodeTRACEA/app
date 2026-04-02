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
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
