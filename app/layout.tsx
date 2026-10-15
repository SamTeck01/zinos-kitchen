import type { Metadata } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CityProvider } from "../data/cityContext";
import Header from "../components/Header";
import OrderBar from "../components/OrderBar";
const archivo = Archivo({ variable: "--font-display", subsets: ["latin"], weight: ["600", "800"] });
const inter = Inter({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500"] });
const jetbrainsMono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"] });
export const metadata: Metadata = { title: "Zino's Kitchen — Jollof Rice & Food by the Litre | Ilorin", description: "Plates of smoky jollof rice, plus jollof, fried rice, stew, beans and swallow by the litre, cooked every Saturday." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en-NG" className={`${archivo.variable} ${inter.variable} ${jetbrainsMono.variable}`}><body className="bg-paper text-char antialiased"><CityProvider><Header /><main className="pb-20 lg:pb-0">{children}</main><OrderBar /></CityProvider></body></html>; }
