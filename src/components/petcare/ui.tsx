import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Calendar, Pill, Syringe, Utensils, Sparkles, Footprints, Check, Clock, MapPin, Stethoscope, Scissors, Scale, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPet, type Appointment, type Reminder, type Activity, type Pet } from "@/lib/petcare-data";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-foreground md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function SectionCard({ title, icon, action, children, className }: { title: string; icon?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("card-soft p-5 md:p-6", className)}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          {icon && <span className="grid size-8 place-items-center rounded-xl bg-secondary text-primary">{icon}</span>}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Btn({ children, variant = "primary", className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "soft" | "ghost" }) {
  const v = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft",
    soft: "bg-secondary text-secondary-foreground hover:bg-accent",
    ghost: "text-primary hover:bg-secondary",
  }[variant];
  return (
    <button {...rest} className={cn("inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors", v, className)}>
      {children}
    </button>
  );
}

export function Pill_({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warn" | "ok" | "danger" }) {
  const t = {
    neutral: "bg-secondary text-secondary-foreground",
    warn: "bg-warm/40 text-primary",
    ok: "bg-success/15 text-success",
    danger: "bg-destructive/12 text-destructive",
  }[tone];
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", t)}>{children}</span>;
}

export function PetAvatar({ pet, size = "md" }: { pet: Pet; size?: "sm" | "md" | "lg" }) {
  const s = { sm: "size-8", md: "size-12", lg: "size-28 md:size-36" }[size];
  return <img src={pet.photo} alt={pet.name} width={816} height={816} loading="lazy" className={cn("rounded-full object-cover ring-2 ring-card", s)} />;
}

const reminderIcon: Record<string, typeof Bell> = { Vacuna: Syringe, Medicamento: Pill, Alimentación: Utensils, Higiene: Sparkles, Actividad: Footprints };

export function ReminderItem({ r, showPet = true }: { r: Reminder; showPet?: boolean }) {
  const Icon = reminderIcon[r.category] ?? Bell;
  const pet = getPet(r.petId)!;
  return (
    <li className={cn("flex items-center gap-3 rounded-2xl border border-border bg-background/60 p-3", r.done && "opacity-60")}>
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", r.urgent ? "bg-primary text-primary-foreground" : "bg-secondary text-primary")}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-semibold", r.done && "line-through")}>{r.title}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {showPet && <><PetAvatar pet={pet} size="sm" /><span className="sr-only">{pet.name}</span></>}
          <span>{showPet && `${pet.name} · `}{r.when} · {r.repeat}</span>
        </p>
      </div>
      <button aria-label={r.done ? "Completado" : "Marcar como hecho"} className={cn("grid size-8 shrink-0 place-items-center rounded-full border-2 transition-colors", r.done ? "border-success bg-success text-primary-foreground" : "border-border hover:border-primary")}>
        {r.done && <Check className="size-4" />}
      </button>
    </li>
  );
}

const apptIcon = { Veterinario: Stethoscope, Peluquería: Scissors, Otro: Calendar };

export function AppointmentItem({ a, showPet = true }: { a: Appointment; showPet?: boolean }) {
  const pet = getPet(a.petId)!;
  const Icon = apptIcon[a.type];
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-border bg-background/60 p-3">
      <div className="grid w-14 shrink-0 place-items-center rounded-xl bg-secondary py-2 text-primary">
        <span className="text-xs font-bold tracking-wider">{a.month}</span>
        <span className="font-display text-2xl leading-none font-semibold">{a.day}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate font-semibold"><Icon className="size-4 text-cocoa" />{a.title}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="size-3" />{a.time}</span>
          <span className="flex items-center gap-1"><MapPin className="size-3" />{a.place}</span>
        </p>
      </div>
      {showPet && (
        <Link to="/mascotas/$petId" params={{ petId: pet.id }} className="shrink-0"><PetAvatar pet={pet} size="sm" /></Link>
      )}
    </li>
  );
}

const actIcon = { salud: Stethoscope, cita: Calendar, peso: Scale, nota: StickyNote, vacuna: Syringe };

export function Timeline({ items, showPet = true }: { items: Activity[]; showPet?: boolean }) {
  return (
    <ol className="relative space-y-5 border-l-2 border-dashed border-border pl-6">
      {items.map((e) => {
        const Icon = actIcon[e.kind];
        const pet = getPet(e.petId)!;
        return (
          <li key={e.id} className="relative">
            <span className="absolute -left-[37px] grid size-6 place-items-center rounded-full bg-card text-primary ring-2 ring-border"><Icon className="size-3.5" /></span>
            <p className="text-sm font-semibold">{showPet && <span className="text-cocoa">{pet.name} · </span>}{e.title}</p>
            <p className="text-sm text-muted-foreground">{e.detail}</p>
            <p className="mt-0.5 text-xs text-muted-foreground/80">{e.when}</p>
          </li>
        );
      })}
    </ol>
  );
}

export function StatTile({ label, value, icon }: { label: string; value: ReactNode; icon: ReactNode }) {
  return (
    <div className="card-soft flex items-center gap-4 p-4">
      <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary">{icon}</span>
      <div>
        <p className="font-display text-2xl font-semibold leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
