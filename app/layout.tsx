import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IA, Globalización y Territorio – Slides",
  description: "Charla sobre IA, globalización y territorio – Nicolás",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}


