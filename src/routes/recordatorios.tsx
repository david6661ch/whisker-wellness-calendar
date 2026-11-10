import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Bell, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { reminders, type ReminderCat } from "@/lib/petcare-data";
import { PageHeader, SectionCard, ReminderItem, Btn } from "@/components/petcare/ui";
import { useProgress } from "@/components/petcare/ProgressProvider";
import { useAccount } from "@/components/petcare/AccountProvider";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMemorials } from "@/lib/memories.functions";
import { localDay } from "@/lib/progress-rules";

export const Route = createFileRoute("/recordatorios")({
  head: () => ({
    meta: [
      { title: "Recordatorios de cuidados · PetCare" },
      { name: "description", content: "Vacunas, medicamentos, alimentación, higiene y actividades recurrentes de tus mascotas." },
      { property: "og:title", content: "Recordatorios · PetCare" },
      { property: "og:description", content: "Nunca olvides un cuidado de tus mascotas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RemindersPage,
});

const cats: ("Todos" | ReminderCat)[] = ["Todos", "Vacuna", "Medicamento", "Alimentación", "Higiene", "Actividad"];

function RemindersPage() {
  const [c, setC] = useState<(typeof cats)[number]>("Todos");
  const { events } = useProgress();
  const { user } = useAccount();
  const loadMemorials = useServerFn(listMemorials);
  const { data: memorials } = useQuery({ queryKey: ["memorials", user?.id], queryFn: () => loadMemorials(), enabled: !!user });
  const deceased = new Set<string>((memorials ?? []).map(m => m.linked_pet_id).filter(x => x != null));
  const list = reminders.filter(r => !deceased.has(r.petId)).map(r => ({...r,done: events.some(e=>e.pet_id===r.petId && e.date===localDay() && e.kind===({Medicamento:"medication",Alimentación:"feeding",Actividad:"walk",Higiene:"hygiene",Vacuna:"vaccine"} as const)[r.category])})).filter((r) => c === "Todos" || r.category === c);
  return (
    <>
      <PageHeader title="Recordatorios" subtitle="Tus responsabilidades de un vistazo." action={<Btn><Plus className="size-4" />Nuevo recordatorio</Btn>} />
      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {cats.map((x) => (
          <button key={x} onClick={() => setC(x)} className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-semibold", c === x ? "bg-primary text-primary-foreground" : "bg-card text-secondary-foreground ring-1 ring-border hover:bg-secondary")}>{x}</button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Pendientes" icon={<Bell className="size-4" />}>
          <ul className="space-y-2.5">{list.filter((r) => !r.done).map((r) => <ReminderItem key={r.id} r={r} />)}</ul>
        </SectionCard>
        <SectionCard title="Completados hoy" icon={<CheckCircle2 className="size-4" />}>
          <ul className="space-y-2.5">{list.filter((r) => r.done).map((r) => <ReminderItem key={r.id} r={r} />)}</ul>
        </SectionCard>
      </div>
    </>
  );
}
