import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Pencil, Info, Stethoscope, Syringe, CalendarDays, History, Plus, AlertTriangle, Pill, Heart, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPet, pets, vaccines, medicalVisits, appointments, reminders, activity } from "@/lib/petcare-data";
import { SectionCard, Btn, Pill_, ReminderItem, AppointmentItem, Timeline } from "@/components/petcare/ui";
import { CareAction } from "@/components/petcare/CareAction";
import { MemorialStatus } from "@/components/petcare/MemorialStatus";
import { ProgressPanel } from "@/components/petcare/ProgressPanel";

export const Route = createFileRoute("/mascotas/$petId")({
  loader: ({ params }) => {
    const pet = getPet(params.petId);
    if (!pet) throw notFound();
    return { pet };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.pet.name} · PetCare` },
          { name: "description", content: `Perfil, salud, vacunas y citas de ${loaderData.pet.name}.` },
          { property: "og:title", content: `${loaderData.pet.name} · PetCare` },
          { property: "og:description", content: `Perfil, salud, vacunas y citas de ${loaderData.pet.name}.` },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [
          { title: "Mascota no encontrada · PetCare" },
          { name: "description", content: "La mascota solicitada no está disponible en PetCare." },
          { property: "og:title", content: "Mascota no encontrada · PetCare" },
          { property: "og:description", content: "La mascota solicitada no está disponible en PetCare." },
          { property: "og:type", content: "website" },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "robots", content: "noindex" },
        ],
  }),
  notFoundComponent: () => (
    <div className="py-20 text-center"><p className="text-xl font-semibold">No encontramos esta mascota.</p><Link to="/mascotas" className="mt-4 inline-block text-primary underline">Volver</Link></div>
  ),
  component: PetProfile,
});

const tabs = [
  { id: "general", label: "General", icon: Info },
  { id: "salud", label: "Historial médico", icon: Stethoscope },
  { id: "vacunas", label: "Vacunas", icon: Syringe },
  { id: "citas", label: "Citas y cuidados", icon: CalendarDays },
  { id: "actividad", label: "Actividad", icon: History },
] as const;
type Tab = (typeof tabs)[number]["id"];

function PetProfile() {
  const { pet } = Route.useLoaderData();
  const [tab, setTab] = useState<Tab>("general");

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link to="/mascotas" className="inline-flex items-center gap-1 text-sm font-semibold text-primary"><ArrowLeft className="size-4" />Mis mascotas</Link>
        <nav aria-label="Cambiar de mascota" className="flex gap-1.5">
          {pets.map((p) => (
            <Link key={p.id} to="/mascotas/$petId" params={{ petId: p.id }} title={p.name} onClick={() => setTab("general")}
              className={cn("rounded-full ring-2 transition", p.id === pet.id ? "ring-primary" : "ring-transparent opacity-60 hover:opacity-100")}>
              <img src={p.photo} alt={p.name} className="size-9 rounded-full object-cover" />
            </Link>
          ))}
        </nav>
      </div>

      <header className="card-soft relative mb-6 overflow-hidden p-6 md:p-8">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-warm opacity-90 md:h-28" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end">
          <img src={pet.photo} alt={pet.name} width={816} height={816} className="size-28 rounded-3xl object-cover ring-4 ring-card md:size-36" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-4xl font-semibold">{pet.name}</h1>
              <Pill_>{pet.species}</Pill_>
              <Pill_>{pet.sex}</Pill_>
            </div>
            <p className="mt-1 text-muted-foreground">{pet.breed} · {pet.age} · {pet.weight}</p>
          </div>
          <CareAction kind="profile" petId={pet.id} title="Perfil revisado" label="Actualizar perfil" />
        </div>
      </header>

      <MemorialStatus petId={pet.id} />

      <div role="tablist" className="mb-6 flex gap-1 overflow-x-auto rounded-full border border-border bg-card p-1">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={cn("flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors", tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary")}>
            <t.icon className="size-4" />{t.label}
          </button>
        ))}
      </div>

      {tab === "general" && <General petId={pet.id} />}
      {tab === "salud" && <Health petId={pet.id} />}
      {tab === "vacunas" && <Vaccines petId={pet.id} />}
      {tab === "citas" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Citas" icon={<CalendarDays className="size-4" />} action={<Btn variant="ghost"><Plus className="size-4" />Nueva</Btn>}>
            <ul className="space-y-2.5">{appointments.filter((a) => a.petId === pet.id).map((a) => <AppointmentItem key={a.id} a={a} showPet={false} />)}</ul>
          </SectionCard>
          <SectionCard title="Recordatorios" icon={<Bell className="size-4" />} action={<Btn variant="ghost"><Plus className="size-4" />Nuevo</Btn>}>
            <ul className="space-y-2.5">{reminders.filter((r) => r.petId === pet.id).map((r) => <ReminderItem key={r.id} r={r} showPet={false} />)}</ul>
          </SectionCard>
        </div>
      )}
      {tab === "actividad" && (
        <SectionCard title="Línea de tiempo" icon={<History className="size-4" />} action={<Btn variant="ghost"><Plus className="size-4" />Nota</Btn>}>
          <Timeline items={activity.filter((e) => e.petId === pet.id)} showPet={false} />
        </SectionCard>
      )}
      <ProgressPanel compact petId={pet.id} />
    </>
  );
}

function General({ petId }: { petId: string }) {
  const pet = getPet(petId)!;
  const facts = [["Especie", pet.species], ["Raza", pet.breed], ["Nacimiento", pet.birthDate], ["Edad", pet.age], ["Peso", pet.weight], ["Tamaño", pet.size], ["Color", pet.color], ["Microchip", pet.microchip]];
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <SectionCard className="lg:col-span-2" title="Información básica" icon={<Info className="size-4" />}>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          {facts.map(([k, v]) => (<div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-semibold">{v}</dd></div>))}
        </dl>
      </SectionCard>
      <SectionCard title="Alertas de salud" icon={<AlertTriangle className="size-4" />}>
        <p className="text-xs text-muted-foreground">Alergias</p>
        <div className="mt-1 mb-3 flex flex-wrap gap-1.5">{pet.allergies.length ? pet.allergies.map((a) => <Pill_ key={a} tone="danger">{a}</Pill_>) : <span className="text-sm">Ninguna conocida</span>}</div>
        <p className="text-xs text-muted-foreground">Condiciones</p>
        <div className="mt-1 flex flex-wrap gap-1.5">{pet.conditions.length ? pet.conditions.map((a) => <Pill_ key={a} tone="warn">{a}</Pill_>) : <span className="text-sm">Ninguna</span>}</div>
      </SectionCard>
      <SectionCard className="lg:col-span-3" title="Personalidad y observaciones" icon={<Heart className="size-4" />}>
        <div className="mb-3 flex flex-wrap gap-2">{pet.personality.map((t) => <Pill_ key={t}>{t}</Pill_>)}</div>
        <p className="text-muted-foreground">{pet.notes}</p>
      </SectionCard>
    </div>
  );
}

function Health({ petId }: { petId: string }) {
  const pet = getPet(petId)!;
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <SectionCard className="lg:col-span-2" title="Visitas veterinarias" icon={<Stethoscope className="size-4" />} action={<CareAction kind="checkup" petId={petId} label="Registrar control" />}>
        <ul className="space-y-3">
          {(medicalVisits[petId] ?? []).map((v) => (
            <li key={v.date} className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">{v.reason}</p>
                <span className="text-xs text-muted-foreground">{v.date}</span>
              </div>
              <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                <div><dt className="text-xs text-muted-foreground">Diagnóstico</dt><dd>{v.diagnosis}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Tratamiento</dt><dd>{v.treatment}</dd></div>
              </dl>
              <p className="mt-2 text-xs text-cocoa">{v.vet}</p>
            </li>
          ))}
        </ul>
      </SectionCard>
      <div className="space-y-6">
        <SectionCard title="Medicamentos" icon={<Pill className="size-4" />}>
          {pet.medications.length ? (
            <ul className="space-y-2">{pet.medications.map((m) => (
              <li key={m.name} className="rounded-2xl bg-secondary/60 p-3"><p className="font-semibold">{m.name}</p><p className="text-xs text-muted-foreground">{m.dose} · hasta {m.until}</p></li>
            ))}</ul>
          ) : <p className="text-sm text-muted-foreground">Sin medicamentos activos.</p>}
        </SectionCard>
        <SectionCard title="Alergias y antecedentes" icon={<AlertTriangle className="size-4" />}>
          <div className="flex flex-wrap gap-1.5">
            {pet.allergies.map((a) => <Pill_ key={a} tone="danger">Alergia: {a}</Pill_>)}
            {pet.conditions.map((a) => <Pill_ key={a} tone="warn">{a}</Pill_>)}
            {!pet.allergies.length && !pet.conditions.length && <p className="text-sm text-muted-foreground">Sin antecedentes registrados.</p>}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function Vaccines({ petId }: { petId: string }) {
  const tone = { "al día": "ok", próxima: "warn", vencida: "danger" } as const;
  return (
    <SectionCard title="Registro de vacunación" icon={<Syringe className="size-4" />} action={<CareAction kind="vaccine" petId={petId} label="Registrar vacuna aplicada" />}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs text-muted-foreground"><tr><th className="pb-3 font-semibold">Vacuna</th><th className="pb-3 font-semibold">Aplicada</th><th className="pb-3 font-semibold">Próxima dosis</th><th className="pb-3 font-semibold">Veterinario</th><th className="pb-3 font-semibold">Estado</th></tr></thead>
          <tbody className="divide-y divide-border">
            {(vaccines[petId] ?? []).map((v) => (
              <tr key={v.name}><td className="py-3 font-semibold">{v.name}</td><td>{v.date}</td><td>{v.next}</td><td className="text-muted-foreground">{v.vet}</td><td><Pill_ tone={tone[v.status]}>{v.status}</Pill_></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
