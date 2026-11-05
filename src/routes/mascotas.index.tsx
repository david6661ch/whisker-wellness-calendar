import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Weight, Cake } from "lucide-react";
import { pets, reminders } from "@/lib/petcare-data";
import { PageHeader, Pill_ } from "@/components/petcare/ui";

export const Route = createFileRoute("/mascotas/")({
  head: () => ({
    meta: [
      { title: "Mis mascotas · PetCare" },
      { name: "description", content: "Todas tus mascotas registradas y acceso rápido a sus perfiles." },
      { property: "og:title", content: "Mis mascotas · PetCare" },
      { property: "og:description", content: "Todas tus mascotas registradas en un solo lugar." },
    ],
  }),
  component: PetsPage,
});

function PetsPage() {
  return (
    <>
      <PageHeader title="Mis mascotas" subtitle="Elige una mascota para ver su perfil completo." />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {pets.map((p) => {
          const pending = reminders.filter((r) => r.petId === p.id && !r.done).length;
          return (
            <Link key={p.id} to="/mascotas/$petId" params={{ petId: p.id }} className="card-soft group overflow-hidden transition-transform hover:-translate-y-1">
              <div className="aspect-[4/3] overflow-hidden bg-secondary">
                <img src={p.photo} alt={p.name} width={816} height={816} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">{p.name}</h2>
                  <Pill_>{p.species}</Pill_>
                </div>
                <p className="text-sm text-muted-foreground">{p.breed}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1.5"><Cake className="size-4 text-cocoa" />{p.age}</span>
                  <span className="flex items-center gap-1.5"><Weight className="size-4 text-cocoa" />{p.weight}</span>
                </div>
                {pending > 0 && <p className="mt-3 text-xs font-semibold text-primary">{pending} cuidado{pending > 1 && "s"} pendiente{pending > 1 && "s"}</p>}
              </div>
            </Link>
          );
        })}
        <Link to="/mascotas/nueva" className="grid min-h-[300px] place-items-center rounded-[calc(var(--radius)+4px)] border-2 border-dashed border-warm text-primary transition-colors hover:bg-secondary">
          <div className="text-center">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary"><Plus className="size-6" /></span>
            <p className="mt-3 font-semibold">Añadir mascota</p>
            <p className="text-sm text-muted-foreground">Solo toma un minuto</p>
          </div>
        </Link>
      </div>
    </>
  );
}
