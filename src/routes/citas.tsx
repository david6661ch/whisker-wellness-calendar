import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { appointments } from "@/lib/petcare-data";
import { PageHeader, SectionCard, AppointmentItem, Btn } from "@/components/petcare/ui";
import { CareAction } from "@/components/petcare/CareAction";

export const Route = createFileRoute("/citas")({
  head: () => ({
    meta: [
      { title: "Citas y consultas · PetCare" },
      { name: "description", content: "Organiza citas veterinarias, peluquería y otras visitas de tus mascotas." },
      { property: "og:title", content: "Citas y consultas · PetCare" },
      { property: "og:description", content: "Organiza las citas de tus mascotas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CitasPage,
});

const filters = ["Todas", "Veterinario", "Peluquería", "Otro"] as const;

function CitasPage() {
  const [f, setF] = useState<(typeof filters)[number]>("Todas");
  const list = appointments.filter((a) => f === "Todas" || a.type === f);
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const marked = new Set(appointments.map((a) => Number(a.day)));
  return (
    <>
      <PageHeader title="Citas y consultas" subtitle="Veterinario, peluquería y otras visitas importantes." action={<CareAction kind="scheduled" label="Nueva cita" />} />
      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="Próximas" icon={<CalendarDays className="size-4" />}>
          <div className="mb-4 flex flex-wrap gap-2">
            {filters.map((x) => (
              <button key={x} onClick={() => setF(x)} className={cn("rounded-full px-3.5 py-1.5 text-sm font-semibold", f === x ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent")}>{x}</button>
            ))}
          </div>
          <ul className="space-y-2.5">{list.map((a) => <AppointmentItem key={a.id} a={a} />)}</ul>
        </SectionCard>
        <SectionCard title="Noviembre 2026">
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["L", "M", "X", "J", "V", "S", "D"].map((d) => <span key={d} className="py-1 font-bold text-muted-foreground">{d}</span>)}
            {Array.from({ length: 6 }).map((_, i) => <span key={`e${i}`} />)}
            {days.map((d) => (
              <span key={d} className={cn("grid aspect-square place-items-center rounded-xl text-sm", d === 5 && "ring-2 ring-primary font-bold", marked.has(d) && "bg-primary text-primary-foreground font-semibold")}>{d}</span>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}
