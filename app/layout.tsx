import type { Metadata } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
const archivo = Archivo({ variable: "--font-display", subsets: ["latin"], weight: ["600", "800"] });
const inter = Inter({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"] });
export const metadata: Metadata = { title: "Zino's Kitchen — Jollof Rice by the Litre", description: "Order jollof rice by the litre. Cooked and delivered every Saturday." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-NG" className={`${archivo.variable} ${inter.variable} ${mono.variable}`}><body className="bg-paper text-char antialiased">{children}</body></html>;
}
