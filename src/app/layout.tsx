import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeetingPrep — Convierte reuniones B2B en propuestas en minutos",
  description:
    "MeetingPrep ayuda a comerciales consultivos a investigar cuentas, preparar preguntas, practicar con roleplay y convertir notas de reunión en propuestas comerciales listas para enviar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Instrument+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
