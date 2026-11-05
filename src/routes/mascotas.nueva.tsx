import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ArrowLeft } from "lucide-react";
import { PageHeader, Btn } from "@/components/petcare/ui";

export const Route = createFileRoute("/mascotas/nueva")({
  head: () => ({
    meta: [
      { title: "Registrar mascota · PetCare" },
      { name: "description", content: "Crea el perfil de tu mascota en un minuto." },
      { property: "og:title", content: "Registrar mascota · PetCare" },
      { property: "og:description", content: "Crea el perfil de tu mascota en un minuto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewPet,
});

const field = "w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function NewPet() {
  return (
    <>
      <Link to="/mascotas" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary"><ArrowLeft className="size-4" />Mis mascotas</Link>
      <PageHeader title="Registrar mascota" subtitle="Lo esencial primero. Podrás completar el resto después." />
      <form onSubmit={(e) => e.preventDefault()} className="card-soft grid gap-6 p-6 md:grid-cols-[200px_1fr] md:p-8">
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-warm bg-secondary/50 text-primary hover:bg-secondary">
          <Camera className="size-8" />
          <span className="text-sm font-semibold">Añadir foto</span>
          <input type="file" accept="image/*" className="sr-only" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2 text-sm font-semibold">Nombre<input className={`${field} mt-1.5`} placeholder="Ej. Luna" /></label>
          <fieldset className="sm:col-span-2">
            <legend className="mb-1.5 text-sm font-semibold">Especie</legend>
            <div className="flex flex-wrap gap-2">
              {["🐶 Perro", "🐱 Gato", "🐰 Conejo", "🐦 Ave", "🐾 Otro"].map((s, i) => (
                <label key={s} className="cursor-pointer">
                  <input type="radio" name="sp" defaultChecked={i === 0} className="peer sr-only" />
                  <span className="block rounded-full border border-border px-4 py-2 text-sm peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">{s}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="text-sm font-semibold">Raza<input className={`${field} mt-1.5`} placeholder="Opcional" /></label>
          <label className="text-sm font-semibold">Fecha de nacimiento<input type="date" className={`${field} mt-1.5`} /></label>
          <label className="text-sm font-semibold">Peso (kg)<input type="number" step="0.1" className={`${field} mt-1.5`} /></label>
          <label className="text-sm font-semibold">Sexo<select className={`${field} mt-1.5`}><option>Hembra</option><option>Macho</option></select></label>
          <label className="sm:col-span-2 text-sm font-semibold">Personalidad y observaciones<textarea rows={3} className={`${field} mt-1.5`} placeholder="¿Cómo es? ¿Algo que debamos saber?" /></label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Link to="/mascotas" className="rounded-full px-4 py-2 text-sm font-semibold text-primary hover:bg-secondary">Cancelar</Link>
            <Btn type="submit">Guardar mascota</Btn>
          </div>
        </div>
      </form>
    </>
  );
}
