import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, PawPrint, CalendarDays, Bell, Plus, Search, BookOpen, Phone, Wallet, LogOut, UserRound } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAccount } from "./AccountProvider";
import { supabase } from "@/integrations/supabase/client";
import { pets } from "@/lib/petcare-data";

const nav = [
  { to: "/", label: "Inicio", icon: LayoutDashboard },
  { to: "/mascotas", label: "Mis mascotas", icon: PawPrint },
  { to: "/citas", label: "Citas", icon: CalendarDays },
  { to: "/recordatorios", label: "Recordatorios", icon: Bell },
] as const;

const linkCls = "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent";
const activeCls = "!bg-primary !text-primary-foreground shadow-soft";

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAccount(); const cache = useQueryClient(); const navigate = useNavigate();
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar p-5 lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2">
          <span className="grid size-10 place-items-center rounded-2xl bg-gradient-warm text-primary-foreground"><PawPrint className="size-5" /></span>
          <span className="font-display text-2xl font-semibold">PetCare</span>
        </Link>
        <nav aria-label="Principal" className="space-y-1">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className={linkCls} activeProps={{ className: activeCls }} activeOptions={{ exact: n.to === "/" }}>
              <n.icon className="size-5" />{n.label}
            </Link>
          ))}
          <div className="mt-4 border-t border-sidebar-border pt-4">
            <Link to="/contactos" className={linkCls} activeProps={{ className: activeCls }}><Phone className="size-5" />Emergencias</Link>
            <Link to="/gastos" className={linkCls} activeProps={{ className: activeCls }}><Wallet className="size-5" />Control de gastos</Link>
          </div>
        </nav>
        <div className="mt-8">
          <p className="mb-2 px-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">Mis mascotas</p>
          <ul className="space-y-1">
            {pets.map((p) => (
              <li key={p.id}>
                <Link to="/mascotas/$petId" params={{ petId: p.id }} className={linkCls} activeProps={{ className: "!bg-sidebar-accent" }}>
                  <img src={p.photo} alt="" className="size-7 rounded-full object-cover" />{p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/mascotas/nueva" className="mt-auto flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-warm px-3 py-3 text-sm font-semibold text-primary hover:bg-sidebar-accent">
          <Plus className="size-4" /> Añadir mascota
        </Link>
      </aside>

      <div className="flex min-w-0 flex-col pb-24 lg:pb-0">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:px-8">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-warm text-primary-foreground"><PawPrint className="size-4" /></span>
            <span className="font-display text-xl font-semibold">PetCare</span>
          </Link>
          <label className="ml-auto hidden max-w-sm flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground md:flex lg:ml-0">
            <Search className="size-4" />
            <input placeholder="Buscar mascota, vacuna, cita…" className="w-full bg-transparent outline-none placeholder:text-muted-foreground" />
          </label>
          <div className="ml-auto flex items-center gap-2">
            <Button asChild variant="outline" size="icon" className="rounded-full lg:hidden" title="Contactos de emergencia"><Link to="/contactos" aria-label="Contactos de emergencia"><Phone /></Link></Button>
            <Button asChild variant="outline" size="icon" className="rounded-full lg:hidden" title="Control de gastos"><Link to="/gastos" aria-label="Control de gastos"><Wallet /></Link></Button>
            <Link to="/consejos" aria-label="Consejos para dueños" title="Consejos para dueños" className="flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-card px-3 text-sm font-semibold text-primary ring-1 ring-border hover:bg-secondary" activeProps={{ className: "!bg-secondary" }}>
              <BookOpen className="size-5" aria-hidden="true" /><span className="hidden xl:inline">Consejos para dueños</span>
            </Link>
            <Link to="/recordatorios" aria-label="Recordatorios" className="relative grid size-10 place-items-center rounded-full bg-card text-primary ring-1 ring-border">
              <Bell className="size-5" /><span className="absolute top-2 right-2.5 size-2 rounded-full bg-destructive" />
            </Link>
            {user ? <Button variant="outline" size="icon" className="rounded-full" aria-label="Cerrar sesión" title="Cerrar sesión" onClick={async () => { await cache.cancelQueries(); cache.clear(); await supabase.auth.signOut(); await navigate({ to: "/auth", replace: true }); }}><LogOut /></Button> : <Button asChild variant="outline" size="icon" className="rounded-full" title="Tu cuenta"><Link to="/auth" aria-label="Tu cuenta"><UserRound /></Link></Button>}
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-10">{children}</main>
      </div>

      <nav aria-label="Navegación móvil" className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 rounded-3xl border border-border bg-card/95 p-1.5 shadow-soft backdrop-blur lg:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} className="flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-semibold text-muted-foreground" activeProps={{ className: "!bg-secondary !text-primary" }} activeOptions={{ exact: n.to === "/" }}>
            <n.icon className="size-5" />{n.label.replace("Mis ", "")}
          </Link>
        ))}
      </nav>
    </div>
  );
}
