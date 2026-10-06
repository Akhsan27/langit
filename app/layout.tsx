import type { Metadata } from "next";
import { PreferencesProvider } from "@/components/Preferences";
import "./globals.css";

export const metadata: Metadata = {
  title: "Langit — Dashboard Cuaca",
  description: "Pantau cuaca dan prakiraan harian untuk kota pilihanmu.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body><PreferencesProvider>{children}</PreferencesProvider></body>
    </html>
  );
}
