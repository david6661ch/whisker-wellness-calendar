import { Suspense, lazy, useState } from "react";
import { createFileRoute, Link, ClientOnly, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Plus, MapPin, Star, Pencil, Trash2, Search, Images, PawPrint, Building2, Trophy, Tag, Crosshair } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader, StatTile, Pill_ } from "@/components/petcare/ui";
import { RecordsGate, Field, fieldClass, DeleteDialog } from "@/components/petcare/record-ui";
import { ExperienciasNav } from "@/components/petcare/ExperienciasNav";
import { MediaField, PetChecks } from "@/components/petcare/memory-ui";
import { useAccount } from "@/components/petcare/AccountProvider";
import { placeSchema, placeCategories, petOptions, petName, formatDay, placeStats, type VisitedPlace, type PlaceInput } from "@/lib/memories";
import { listPlaces, savePlace, deletePlace, listMemorials } from "@/lib/memories.functions";

const PlacesMap = lazy(() => import("@/components/petcare/PlacesMap"));

export const Route = createFileRoute("/lugares")({
  validateSearch: (s: Record<string, unknown>) => ({ mascota: typeof s["mascota"] === "string" ? s["mascota"] : "" }),
  head: () => ({ meta: [{ title: "Lugares que hemos visitado · PetCare" }, { name: "description", content: "Un mapa personal con los parques, cafeterías y rincones que has visitado junto a tus mascotas." }, { property: "og:title", content: "Lugares que hemos visitado · PetCare" }, { property: "og:description", content: "Registra en el mapa las experiencias compartidas con tus mascotas." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: PlacesPage,
});

function PlacesPage() {
  return (
    <div className="care-palette">
      <PageHeader title="Lugares que hemos visitado" subtitle="Un mapa con la historia de sus aventuras juntos." />
      <ExperienciasNav />
      <RecordsGate><Places /></RecordsGate>
    </div>
  );
}

const emptyPlace: PlaceInput = { name: "", category: "Parques", address: "", lat: 4.6, lng: -74.08, visit_date: "", pet_ids: [], description: "", photo_path: null, rating: null, review: "", pet_friendly: null, water_available: null, good_treatment: null, recommended: null };

type NominatimResult = { display_name: string; lat: string; lon: string };

function Places() {
  const { user } = useAccount(); const cache = useQueryClient(); const navigate = useNavigate();
  const { mascota } = Route.useSearch();
  const load = useServerFn(listPlaces); const save = useServerFn(savePlace); const remove = useServerFn(deletePlace); const loadMemorials = useServerFn(listMemorials);
  const key = ["places", user?.id];
  const { data: places } = useSuspenseQuery({ queryKey: key, queryFn: () => load() });
  const { data: memorials } = useSuspenseQuery({ queryKey: ["memorials", user?.id], queryFn: () => loadMemorials() });
  const options = petOptions(memorials);

  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<VisitedPlace | "new" | null>(null);
  const [deleting, setDeleting] = useState<VisitedPlace | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<PlaceInput>(emptyPlace);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [focus, setFocus] = useState<{ lat: number; lng: number } | null>(null);
  const update = <K extends keyof PlaceInput>(k: K, value: PlaceInput[K]) => setForm(f => ({ ...f, [k]: value }));

  const rows = places.filter(p => (!mascota || p.pet_ids.includes(mascota)) && (!category || p.category === category));
  const stats = placeStats(rows);
  const current = selected ? rows.find(p => p.id === selected) ?? null : null;
  const open = (p?: VisitedPlace) => {
    setEditing(p ?? "new");
    setForm(p ? { ...p } : { ...emptyPlace, visit_date: new Date().toISOString().slice(0, 10) });
    setPreview(p?.photo_url ?? null); setErrors({}); setQuery(""); setResults([]);
  };
  async function searchPlace() {
    const q = query.trim(); if (q.length < 3 || searching) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(q)}`, { headers: { "Accept-Language": "es" } });
      if (!res.ok) throw new Error();
      setResults(await res.json() as NominatimResult[]);
    } catch { toast.error("No se pudo buscar el lugar. Inténtalo de nuevo."); setResults([]); }
    finally { setSearching(false); }
  }

  return <>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        <select aria-label="Filtrar por mascota" className={fieldClass + " !w-auto"} value={mascota} onChange={e => void navigate({ to: "/lugares", search: { mascota: e.target.value }, replace: true })}>
          <option value="">Todas las mascotas</option>{options.map(o => <option key={o.id} value={o.id}>{o.deceased ? `${o.name} · In memoriam` : o.name}</option>)}
        </select>
        <select aria-label="Filtrar por categoría" className={fieldClass + " !w-auto"} value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Todas las categorías</option>{placeCategories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <Button className="rounded-full" onClick={() => open()}><Plus />Registrar lugar</Button>
    </div>

    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile label="Lugares visitados" value={stats.total} icon={<MapPin className="size-5" />} />
      <StatTile label="Ciudades exploradas" value={stats.cities} icon={<Building2 className="size-5" />} />
      <StatTile label="Lugar más visitado" value={stats.mostVisited ? `${stats.mostVisited.name} (${stats.mostVisited.count})` : "—"} icon={<Trophy className="size-5" />} />
      <StatTile label="Mascota con más experiencias" value={stats.topPet ? `${petName(stats.topPet.id, memorials)} (${stats.topPet.count})` : "—"} icon={<PawPrint className="size-5" />} />
    </div>

    <ClientOnly fallback={<div className="grid h-[380px] w-full place-items-center rounded-2xl border border-border bg-card text-sm text-muted-foreground md:h-[460px]">Cargando mapa…</div>}>
      <Suspense fallback={<div className="grid h-[380px] w-full place-items-center rounded-2xl border border-border bg-card text-sm text-muted-foreground md:h-[460px]">Cargando mapa…</div>}>
        <PlacesMap places={rows} focus={focus} onSelect={id => setSelected(id)} />
      </Suspense>
    </ClientOnly>
    {!rows.length && <p className="mt-4 text-center text-sm text-muted-foreground">{places.length ? "No hay lugares con estos filtros." : "Aún no has registrado lugares. Usa «Registrar lugar» para marcar tu primera aventura."}</p>}

    {current && (
      <article className="card-soft mt-6 overflow-hidden">
        <div className="grid md:grid-cols-[240px_1fr]">
          {current.photo_url ? <img src={current.photo_url} alt={current.name} className="h-48 w-full object-cover md:h-full" /> : <div className="grid h-48 w-full place-items-center bg-secondary text-primary md:h-full"><MapPin className="size-10" /></div>}
          <div className="p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-2xl font-semibold">{current.name}</h2>
                <p className="text-sm text-muted-foreground">{current.category}{current.address && ` · ${current.address}`}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" title="Editar lugar" aria-label={`Editar ${current.name}`} onClick={() => open(current)}><Pencil /></Button>
                <Button variant="ghost" size="icon" title="Eliminar lugar" aria-label={`Eliminar ${current.name}`} onClick={() => setDeleting(current)}><Trash2 /></Button>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Visitado el {formatDay(current.visit_date)}</p>
            {current.rating && <p className="mt-2 flex items-center gap-1" aria-label={`Calificación personal: ${current.rating} de 5`}>{[1, 2, 3, 4, 5].map(n => <Star key={n} className={`size-4 ${n <= current.rating! ? "fill-primary text-primary" : "text-border"}`} />)}</p>}
            <div className="mt-2 flex flex-wrap gap-1.5">{current.pet_ids.map(id => <Pill_ key={id}>{petName(id, memorials)}</Pill_>)}</div>
            {current.description && <p className="mt-3 whitespace-pre-wrap break-words text-sm text-muted-foreground">{current.description}</p>}
            {current.review && <blockquote className="mt-3 border-l-2 border-warm pl-3 text-sm italic text-cocoa">«{current.review}»</blockquote>}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {current.pet_friendly && <Pill_ tone="ok">Pet-friendly</Pill_>}
              {current.water_available && <Pill_ tone="ok">Agua disponible</Pill_>}
              {current.good_treatment && <Pill_ tone="ok">Buen trato</Pill_>}
              {current.recommended && <Pill_ tone="ok">Lo recomiendo</Pill_>}
            </div>
            <Button asChild variant="outline" className="mt-4 rounded-full"><Link to="/recuerdos" search={{ mascota: current.pet_ids[0] ?? "" }}><Images />Ver recuerdos de esta visita</Link></Button>
          </div>
        </div>
      </article>
    )}

    <Dialog open={editing !== null} onOpenChange={o => { if (!o && !busy) setEditing(null); }}>
      <DialogContent className="max-h-[90dvh] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogTitle>{editing === "new" ? "Registrar lugar visitado" : `Editar ${form.name}`}</DialogTitle>
        <DialogDescription>Tu experiencia personal: no es una reseña verificada de terceros.</DialogDescription>
        <form className="grid gap-4" noValidate onSubmit={async e => {
          e.preventDefault();
          const parsed = placeSchema.safeParse(form);
          if (!parsed.success) { setErrors(Object.fromEntries(parsed.error.issues.map(i => [String(i.path[0]), i.message]))); return; }
          setBusy(true);
          try {
            await save({ data: { ...parsed.data, id: editing && editing !== "new" ? editing.id : undefined } });
            await cache.invalidateQueries({ queryKey: key });
            setEditing(null); toast.success("Lugar guardado");
          } catch { toast.error("No se pudo guardar el lugar."); } finally { setBusy(false); }
        }}>
          <div className="grid gap-1.5 text-sm font-semibold">
            <span>Buscar el lugar</span>
            <div className="flex gap-2">
              <input className={fieldClass} placeholder="Nombre o dirección…" maxLength={200} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); void searchPlace(); } }} />
              <Button type="button" variant="outline" disabled={searching} onClick={() => void searchPlace()} aria-label="Buscar"><Search />{searching ? "…" : ""}</Button>
            </div>
            {results.length > 0 && (
              <ul className="divide-y divide-border rounded-lg border border-border bg-card text-sm font-normal">
                {results.map((r, i) => (
                  <li key={i}><button type="button" className="w-full px-3 py-2 text-left hover:bg-secondary" onClick={() => { update("lat", Number(r.lat)); update("lng", Number(r.lng)); if (!form.address) update("address", r.display_name.split(",").slice(0, 3).join(",").trim()); setFocus({ lat: Number(r.lat), lng: Number(r.lng) }); setResults([]); }}>{r.display_name}</button></li>
                ))}
              </ul>
            )}
            <button type="button" className="flex items-center gap-2 text-left text-xs font-semibold text-primary hover:underline" onClick={() => { toast.info("Cierra esta ventana y toca el mapa en el punto exacto; luego vuelve a abrir el formulario con las coordenadas listas."); }}>
              <Crosshair className="size-3.5" />También puedes escribir las coordenadas manualmente abajo
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Latitud" type="number" step="any" required value={form.lat} error={errors["lat"]} onChange={e => update("lat", Number(e.target.value))} />
            <Field label="Longitud" type="number" step="any" required value={form.lng} error={errors["lng"]} onChange={e => update("lng", Number(e.target.value))} />
          </div>
          <Field label="Nombre del lugar" maxLength={120} required value={form.name} error={errors["name"]} onChange={e => update("name", e.target.value)} />
          <label className="grid gap-1.5 text-sm font-semibold">Categoría<select className={fieldClass} value={form.category} onChange={e => update("category", e.target.value as PlaceInput["category"])}>{placeCategories.map(c => <option key={c}>{c}</option>)}</select></label>
          <Field label="Dirección (opcional)" maxLength={250} value={form.address} error={errors["address"]} onChange={e => update("address", e.target.value)} />
          <Field label="Fecha de la visita" type="date" required value={form.visit_date} error={errors["visit_date"]} onChange={e => update("visit_date", e.target.value)} />
          <PetChecks options={options} value={form.pet_ids} onChange={ids => update("pet_ids", ids)} />
          {errors["pet_ids"] && <p className="text-xs text-primary" role="alert">{errors["pet_ids"]}</p>}
          <MediaField label="Fotografía (opcional)" url={preview} accept="image/*" onChange={(path, url) => { update("photo_path", path); setPreview(url); }} />
          <label className="grid gap-1.5 text-sm font-semibold">¿Cómo fue la experiencia? (opcional)<textarea className={fieldClass} rows={3} maxLength={2000} value={form.description} onChange={e => update("description", e.target.value)} /></label>
          <fieldset className="grid gap-1.5 text-sm font-semibold">
            <legend>Mi calificación personal (opcional)</legend>
            <div className="flex gap-1" role="radiogroup" aria-label="Calificación de 1 a 5 estrellas">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`} aria-pressed={form.rating === n} onClick={() => update("rating", form.rating === n ? null : n)}>
                  <Star className={`size-7 ${form.rating !== null && n <= form.rating ? "fill-primary text-primary" : "text-border"}`} />
                </button>
              ))}
            </div>
          </fieldset>
          <label className="grid gap-1.5 text-sm font-semibold">Mi comentario (opcional)<textarea className={fieldClass} rows={3} maxLength={2000} value={form.review} onChange={e => update("review", e.target.value)} placeholder="Cómo trataron a tu mascota, qué volverías a hacer…" /></label>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            {([["pet_friendly", "El lugar es pet-friendly"], ["water_available", "Hay agua o espacios adecuados"], ["good_treatment", "Buen trato del establecimiento"], ["recommended", "Lo recomiendo"]] as const).map(([k, label]) => (
              <label key={k} className="flex items-center gap-2"><input type="checkbox" checked={form[k] ?? false} onChange={e => update(k, e.target.checked ? true : null)} />{label}</label>
            ))}
          </div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => setEditing(null)}>Cancelar</Button><Button type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar lugar"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
    {deleting && <DeleteDialog name={deleting.name} busy={busy} onCancel={() => setDeleting(null)} onConfirm={async () => { setBusy(true); try { await remove({ data: { id: deleting.id } }); await cache.invalidateQueries({ queryKey: key }); setDeleting(null); setSelected(null); toast.success("Lugar eliminado"); } catch { toast.error("No se pudo eliminar el lugar."); } finally { setBusy(false); } }} />}
    {stats.categories.length > 0 && (
      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><Tag className="size-4" />Categorías más frecuentadas: {stats.categories.slice(0, 3).map(([c, n]) => `${c} (${n})`).join(", ")}</p>
    )}
  </>;
}
