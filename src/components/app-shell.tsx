import Link from "next/link";
import { BarChart3, Boxes, CalendarClock, CircleDollarSign, ContactRound, Handshake, LayoutDashboard, PackageOpen, Settings, ShoppingBag } from "lucide-react";
import { BrandMark } from "./brand-mark";

const links = [
  ["/dashboard", "Visão mensal", LayoutDashboard], ["/products", "Produtos", PackageOpen],
  ["/inventory", "Estoque", Boxes], ["/clients", "Clientes", ContactRound],
  ["/orders", "Pedidos", ShoppingBag], ["/production", "Produção", CalendarClock],
  ["/content", "Conteúdo", BarChart3], ["/partners", "Parceiros", Handshake],
  ["/finance", "Caixa", CircleDollarSign], ["/settings", "Ajustes", Settings],
] as const;

export function AppShell({ children, userName = "Equipe Lamelle" }: { children: React.ReactNode; userName?: string }) {
  return <div className="app-frame">
    <header className="masthead"><BrandMark/><div className="masthead-user"><span className="eyebrow">Sessão ativa</span><b>{userName}</b></div></header>
    <nav className="main-nav" aria-label="Principal">{links.map(([href,label,Icon])=><Link href={href} key={href}><Icon size={15}/><span>{label}</span></Link>)}</nav>
    <main className="main-content">{children}</main>
  </div>;
}
