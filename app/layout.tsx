import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Langit — Dashboard Cuaca",
  description: "Pantau cuaca dan prakiraan harian untuk kota pilihanmu.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
