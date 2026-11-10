import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Heart, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader } from "@/components/petcare/ui";
import { RecordsGate, Field, fieldClass, DeleteDialog } from "@/components/petcare/record-ui";
import { ExperienciasNav } from "@/components/petcare/ExperienciasNav";
import { MediaField } from "@/components/petcare/memory-ui";
import { useAccount } from "@/components/petcare/AccountProvider";
import { memorialSchema, speciesList, formatDay, type Memorial, type MemorialInput } from "@/lib/memories";
import { listMemorials, saveMemorial, deleteMemorial } from "@/lib/memories.functions";
import { pets } from "@/lib/petcare-data";

export const Route = createFileRoute("/memoriam")({ head: () => ({ meta: [{ title: "In Memoriam · PetCare" }, { name: "description", content: "Un espacio tranquilo para honrar y conservar la memoria de las mascotas que ya no están." }, { property: "og:title", content: "In Memoriam · PetCare" }, { property: "og:description", content: "Conserva la historia de las mascotas que formaron parte de tu vida." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: MemoriamPage });

function MemoriamPage() {
  return (
    <div className="care-palette">
      <PageHeader title="In Memoriam" subtitle="Un rincón tranquilo para quienes siempre serán parte de la familia." />
      <ExperienciasNav />
      <RecordsGate><Memorials /></RecordsGate>
    </div>
  );
}

const empty: MemorialInput = { linked_pet_id: null, name: "", species: "Perro", breed: "", birth_date: null, death_date: "", bio: "", memories_text: "", dedication: "", photo_path: null, before_signup: false };

function Memorials() {
  const { user } = useAccount(); const cache = useQueryClient();
  const load = useServerFn(listMemorials); const save = useServerFn(saveMemorial); const remove = useServerFn(deleteMemorial);
  const key = ["memorials", user?.id];
  const { data } = useSuspenseQuery({ queryKey: key, queryFn: () => load() });
  const [editing, setEditing] = useState<Memorial | "new" | null>(null);
  const [deleting, setDeleting] = useState<Memorial | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<MemorialInput>(empty);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const update = <K extends keyof MemorialInput>(k: K, value: MemorialInput[K]) => setForm(f => ({ ...f, [k]: value }));
  const open = (m?: Memorial) => { setEditing(m ?? "new"); setForm(m ?? empty); setPreview(m?.photo_url ?? null); setErrors({}); };

  return <>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <p className="flex items-center gap-2 text-sm text-muted-foreground"><Heart className="size-5 text-primary" />{data.length} {data.length === 1 ? "memorial" : "memoriales"}</p>
      <Button className="rounded-full" onClick={() => open()}><Plus />Registrar un memorial</Button>
    </div>
    {!data.length && (
      <div className="border-y border-border py-16 text-center">
        <Heart className="mx-auto mb-4 size-9 text-primary" />
        <h2 className="text-xl font-semibold">Aquí vivirá su historia</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Cuando estés listo, puedes crear un memorial para una mascota que te acompañó, incluso si fue antes de que llegaras a PetCare.</p>
      </div>
    )}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map(m => (
        <article key={m.id} className="card-soft group flex min-w-0 flex-col overflow-hidden">
          <Link to="/memoriam/$memorialId" params={{ memorialId: m.id }} className="block">
            {m.photo_url
              ? <img src={m.photo_url} alt={m.name} className="aspect-[4/3] w-full object-cover" />
              : <div className="grid aspect-[4/3] w-full place-items-center bg-secondary text-primary"><Heart className="size-10" /></div>}
            <div className="p-5">
              <h2 className="text-xl font-semibold">{m.name}</h2>
              <p className="text-sm text-muted-foreground">{m.species}{m.breed && ` · ${m.breed}`}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.birth_date ? `${formatDay(m.birth_date)} — ` : ""}{formatDay(m.death_date)}</p>
              {m.dedication && <p className="mt-3 font-display text-sm italic text-cocoa">«{m.dedication}»</p>}
            </div>
          </Link>
          <div className="mt-auto flex justify-end gap-1 border-t border-border px-3 py-2">
            <Button variant="ghost" size="icon" title="Editar memorial" aria-label={`Editar el memorial de ${m.name}`} onClick={() => open(m)}><Pencil /></Button>
            <Button variant="ghost" size="icon" title="Eliminar memorial" aria-label={`Eliminar el memorial de ${m.name}`} onClick={() => setDeleting(m)}><Trash2 /></Button>
          </div>
        </article>
      ))}
    </div>
    <Dialog open={editing !== null} onOpenChange={o => { if (!o && !busy) setEditing(null); }}>
      <DialogContent className="max-h-[90dvh] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogTitle>{editing === "new" ? "Registrar un memorial" : `Editar el memorial de ${form.name}`}</DialogTitle>
        <DialogDescription>Conserva su historia con cariño. Solo tú puedes verla.</DialogDescription>
        <form className="grid gap-4" noValidate onSubmit={async e => {
          e.preventDefault();
          const parsed = memorialSchema.safeParse(form);
          if (!parsed.success) { setErrors(Object.fromEntries(parsed.error.issues.map(i => [String(i.path[0]), i.message]))); return; }
          setBusy(true);
          try {
            await save({ data: { ...parsed.data, id: editing && editing !== "new" ? editing.id : undefined } });
            await cache.invalidateQueries({ queryKey: key });
            setEditing(null); toast.success("Memorial guardado");
          } catch { toast.error("No se pudo guardar el memorial."); } finally { setBusy(false); }
        }}>
          <MediaField label="Fotografía principal" url={preview} accept="image/*" onChange={(path, url) => { update("photo_path", path); setPreview(url); }} />
          <Field label="Nombre" maxLength={80} required value={form.name} error={errors["name"]} onChange={e => update("name", e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold">Especie<select className={fieldClass} value={form.species} onChange={e => update("species", e.target.value)}>{speciesList.map(s => <option key={s}>{s}</option>)}</select></label>
            <Field label="Raza (opcional)" maxLength={80} value={form.breed} error={errors["breed"]} onChange={e => update("breed", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nacimiento (opcional)" type="date" value={form.birth_date ?? ""} error={errors["birth_date"]} onChange={e => update("birth_date", e.target.value || null)} />
            <Field label="Fallecimiento" type="date" required value={form.death_date} error={errors["death_date"]} onChange={e => update("death_date", e.target.value)} />
          </div>
          <label className="grid gap-1.5 text-sm font-semibold">¿Era una de tus mascotas en PetCare? (opcional)
            <select className={fieldClass} value={form.linked_pet_id ?? ""} onChange={e => update("linked_pet_id", (e.target.value || null) as MemorialInput["linked_pet_id"])}>
              <option value="">No estaba registrada en PetCare</option>
              {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.before_signup} onChange={e => update("before_signup", e.target.checked)} />Falleció antes de que creara mi cuenta</label>
          <label className="grid gap-1.5 text-sm font-semibold">Su historia (opcional)<textarea className={fieldClass} rows={3} maxLength={2000} value={form.bio} onChange={e => update("bio", e.target.value)} placeholder="Cómo llegó a tu vida, cómo era…" /></label>
          <label className="grid gap-1.5 text-sm font-semibold">Recuerdos y momentos especiales (opcional)<textarea className={fieldClass} rows={3} maxLength={2000} value={form.memories_text} onChange={e => update("memories_text", e.target.value)} placeholder="Esos pequeños momentos que no quieres olvidar…" /></label>
          <Field label="Dedicatoria (opcional)" maxLength={200} value={form.dedication} error={errors["dedication"]} onChange={e => update("dedication", e.target.value)} placeholder="Una frase para recordarla" />
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => setEditing(null)}>Cancelar</Button><Button type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar memorial"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
    {deleting && <DeleteDialog name={`el memorial de ${deleting.name}`} busy={busy} onCancel={() => setDeleting(null)} onConfirm={async () => { setBusy(true); try { await remove({ data: { id: deleting.id } }); await cache.invalidateQueries({ queryKey: key }); setDeleting(null); toast.success("Memorial eliminado"); } catch { toast.error("No se pudo eliminar el memorial."); } finally { setBusy(false); } }} />}
  </>;
}
