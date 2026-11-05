import { createFileRoute, Link } from "@tanstack/react-router";
import { PawPrint, CalendarDays, Bell, Syringe, Plus, ChevronRight, History } from "lucide-react";
import { pets, appointments, reminders, activity } from "@/lib/petcare-data";
import { PageHeader, SectionCard, StatTile, ReminderItem, AppointmentItem, Timeline, Pill_ } from "@/components/petcare/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inicio · PetCare" },
      { name: "description", content: "Resumen de tus mascotas, próximas citas, tareas pendientes y actividad reciente." },
      { property: "og:title", content: "Inicio · PetCare" },
      { property: "og:description", content: "Resumen de tus mascotas, próximas citas y tareas pendientes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const pending = reminders.filter((r) => !r.done);
  return (
    <>
      <PageHeader
        title="¡Hola, Valentina! 🐾"
        subtitle={`Hoy tienes ${pending.length} cuidados pendientes y ${appointments.length} citas este mes.`}
        action={
          <Link to="/mascotas/nueva" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft hover:bg-primary/90">
            <Plus className="size-4" /> Registrar mascota
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatTile label="Mascotas" value={pets.length} icon={<PawPrint className="size-5" />} />
        <StatTile label="Citas próximas" value={appointments.length} icon={<CalendarDays className="size-5" />} />
        <StatTile label="Pendientes hoy" value={pending.length} icon={<Bell className="size-5" />} />
        <StatTile label="Vacunas por vencer" value={3} icon={<Syringe className="size-5" />} />
      </div>

      <section aria-label="Mis mascotas" className="mb-6 flex gap-4 overflow-x-auto pb-2">
        {pets.map((p) => (
          <Link key={p.id} to="/mascotas/$petId" params={{ petId: p.id }} className="card-soft group flex min-w-[240px] flex-1 items-center gap-4 p-4 transition-transform hover:-translate-y-0.5">
            <img src={p.photo} alt={p.name} width={816} height={816} className="size-16 rounded-2xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl font-semibold">{p.name}</p>
              <p className="text-sm text-muted-foreground">{p.breed} · {p.age}</p>
            </div>
            <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <SectionCard className="lg:col-span-3" title="Cuidados pendientes" icon={<Bell className="size-4" />}
          action={<Link to="/recordatorios" className="text-sm font-semibold text-primary hover:underline">Ver todos</Link>}>
          <ul className="space-y-2.5">{reminders.slice(0, 5).map((r) => <ReminderItem key={r.id} r={r} />)}</ul>
        </SectionCard>
        <SectionCard className="lg:col-span-2" title="Próximas citas" icon={<CalendarDays className="size-4" />}
          action={<Link to="/citas" className="text-sm font-semibold text-primary hover:underline">Agenda</Link>}>
          <ul className="space-y-2.5">{appointments.slice(0, 3).map((a) => <AppointmentItem key={a.id} a={a} />)}</ul>
        </SectionCard>
        <SectionCard className="lg:col-span-3" title="Actividad reciente" icon={<History className="size-4" />}>
          <Timeline items={activity.slice(0, 5)} />
        </SectionCard>
        <section className="flex flex-col justify-between rounded-[calc(var(--radius)+4px)] bg-gradient-warm p-6 text-primary-foreground shadow-soft lg:col-span-2">
          <div>
            <Pill_>Consejo del día</Pill_>
            <h2 className="mt-3 text-2xl font-semibold">Hidratación en días cálidos</h2>
            <p className="mt-2 text-sm opacity-90">Deja varios cuencos de agua fresca en casa. Los gatos como Milo suelen beber más de fuentes en movimiento.</p>
          </div>
          <PawPrint className="mt-6 size-10 self-end opacity-40" />
        </section>
      </div>
    </>
  );
}
