import type { Metadata } from "next";
import { Bodoni_Moda, IBM_Plex_Mono, Karla } from "next/font/google";
import "./globals.css";

const display=Bodoni_Moda({subsets:["latin"],variable:"--font-display"});
const body=Karla({subsets:["latin"],variable:"--font-body"});
const mono=IBM_Plex_Mono({subsets:["latin"],weight:["400","500"],variable:"--font-mono"});
export const metadata:Metadata={title:"Lamelle 3D · Painel operacional",description:"Gestão da Lamelle 3D"};

export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR" className={`${display.variable} ${body.variable} ${mono.variable}`}><body>{children}</body></html>}
