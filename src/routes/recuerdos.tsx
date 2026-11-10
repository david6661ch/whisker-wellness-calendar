import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Plus, Images, Star, Pencil, Trash2, ChevronLeft, ChevronRight, Download, FolderPlus, X, Film } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader, Pill_ } from "@/components/petcare/ui";
import { RecordsGate, Field, fieldClass, DeleteDialog } from "@/components/petcare/record-ui";
import { ExperienciasNav } from "@/components/petcare/ExperienciasNav";
import { MediaField, PetChecks } from "@/components/petcare/memory-ui";
import { useAccount } from "@/components/petcare/AccountProvider";
import { memorySchema, albumSchema, petOptions, petName, formatDay, type MemoryItem, type MemoryInput, type Album, type AlbumInput } from "@/lib/memories";
import { listMemories, saveMemory, deleteMemory, listAlbums, saveAlbum, deleteAlbum, listMemorials } from "@/lib/memories.functions";
import { pets } from "@/lib/petcare-data";

export const Route = createFileRoute("/recuerdos")({
  validateSearch: (s: Record<string, unknown>) => ({ mascota: typeof s["mascota"] === "string" ? s["mascota"] : "" }),
  head: () => ({ meta: [{ title: "Nuestros recuerdos · PetCare" }, { name: "description", content: "Tu galería privada de fotografías, videos y momentos especiales con tus mascotas." }, { property: "og:title", content: "Nuestros recuerdos · PetCare" }, { property: "og:description", content: "Conserva fotos, videos e historias de todas tus mascotas en un solo lugar." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: MemoriesPage,
});

function MemoriesPage() {
  return (
    <div className="care-palette">
      <PageHeader title="Nuestros recuerdos" subtitle="Cada foto y cada video cuenta un pedazo de su historia." />
      <ExperienciasNav />
      <RecordsGate><Gallery /></RecordsGate>
    </div>
  );
}

const emptyMemory: MemoryInput = { title: "", description: "", memory_date: "", media_type: "photo", media_path: "", favorite: false, album_id: null, pet_ids: [] };
const mediaTypeOf = (path: string) => (/\.(mp4|webm|mov|m4v)$/i.test(path) ? "video" : "photo") as MemoryInput["media_type"];

function Gallery() {
  const { user } = useAccount(); const cache = useQueryClient(); const navigate = useNavigate();
  const { mascota } = Route.useSearch();
  const fns = { memories: useServerFn(listMemories), albums: useServerFn(listAlbums), memorials: useServerFn(listMemorials), save: useServerFn(saveMemory), remove: useServerFn(deleteMemory), saveAlb: useServerFn(saveAlbum), removeAlb: useServerFn(deleteAlbum) };
  const { data: memories } = useSuspenseQuery({ queryKey: ["memories", user?.id], queryFn: () => fns.memories() });
  const { data: albums } = useSuspenseQuery({ queryKey: ["albums", user?.id], queryFn: () => fns.albums() });
  const { data: memorials } = useSuspenseQuery({ queryKey: ["memorials", user?.id], queryFn: () => fns.memorials() });
  const options = petOptions(memorials);
  const deceasedIds = useMemo(() => new Set<string>([...memorials.map(m => m.id), ...memorials.map(m => m.linked_pet_id).filter(x => x != null)]), [memorials]);

  const [type, setType] = useState<"" | "photo" | "video">("");
  const [onlyFav, setOnlyFav] = useState(false);
  const [album, setAlbum] = useState("");
  const [order, setOrder] = useState<"desc" | "asc">("desc");
  const [editing, setEditing] = useState<MemoryItem | "new" | null>(null);
  const [deleting, setDeleting] = useState<MemoryItem | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [albumsOpen, setAlbumsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<MemoryInput>(emptyMemory);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const update = <K extends keyof MemoryInput>(k: K, value: MemoryInput[K]) => setForm(f => ({ ...f, [k]: value }));

  const setPetFilter = (v: string) => void navigate({ to: "/recuerdos", search: { mascota: v }, replace: true });
  const rows = memories
    .filter(m => (!mascota || m.pet_ids.includes(mascota)) && (!type || m.media_type === type) && (!onlyFav || m.favorite) && (!album || m.album_id === album))
    .sort((a, b) => order === "desc" ? b.memory_date.localeCompare(a.memory_date) : a.memory_date.localeCompare(b.memory_date));
  const open = (m?: MemoryItem) => { setEditing(m ?? "new"); setForm(m ? { ...m } : { ...emptyMemory, memory_date: new Date().toISOString().slice(0, 10) }); setPreview(m?.media_url ?? null); setErrors({}); };
  async function toggleFav(m: MemoryItem) {
    try { await fns.save({ data: { ...m, favorite: !m.favorite, id: m.id } }); await cache.invalidateQueries({ queryKey: ["memories", user?.id] }); }
    catch { toast.error("No se pudo actualizar el recuerdo."); }
  }
  async function confirmDelete() {
    if (!deleting) return; setBusy(true);
    try { await fns.remove({ data: { id: deleting.id } }); await cache.invalidateQueries({ queryKey: ["memories", user?.id] }); setDeleting(null); setLightbox(null); toast.success("Recuerdo eliminado"); }
    catch { toast.error("No se pudo eliminar el recuerdo."); } finally { setBusy(false); }
  }
  const current = lightbox !== null ? rows[lightbox] : undefined;
  const petFilterButtons: { id: string; label: string }[] = [{ id: "", label: "Todas las mascotas" }, ...options.map(o => ({ id: o.id, label: o.deceased ? `${o.name} · In memoriam` : o.name }))];

  return <>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <p className="flex items-center gap-2 text-sm text-muted-foreground"><Images className="size-5 text-primary" />{memories.length} {memories.length === 1 ? "recuerdo" : "recuerdos"} · privados, solo para ti</p>
      <div className="flex gap-2">
        <Button variant="outline" className="rounded-full" onClick={() => setAlbumsOpen(true)}><FolderPlus />Álbumes</Button>
        <Button className="rounded-full" onClick={() => open()}><Plus />Añadir recuerdo</Button>
      </div>
    </div>
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por mascota">
      {petFilterButtons.map(b => <button key={b.id} onClick={() => setPetFilter(b.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${mascota === b.id ? "bg-primary text-primary-foreground" : "bg-card text-secondary-foreground ring-1 ring-border hover:bg-secondary"}`}>{b.label}</button>)}
    </div>
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <select aria-label="Tipo de recuerdo" className={fieldClass + " !w-auto"} value={type} onChange={e => setType(e.target.value as typeof type)}>
        <option value="">Fotos y videos</option><option value="photo">Fotografías</option><option value="video">Videos</option>
      </select>
      <select aria-label="Álbum" className={fieldClass + " !w-auto"} value={album} onChange={e => setAlbum(e.target.value)}>
        <option value="">Todos los álbumes</option>{albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <select aria-label="Ordenar por fecha" className={fieldClass + " !w-auto"} value={order} onChange={e => setOrder(e.target.value as typeof order)}>
        <option value="desc">Más recientes primero</option><option value="asc">Más antiguos primero</option>
      </select>
      <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={onlyFav} onChange={e => setOnlyFav(e.target.checked)} />Favoritos</label>
    </div>
    {!rows.length && (
      <div className="border-y border-border py-16 text-center">
        <Images className="mx-auto mb-4 size-9 text-primary" />
        <h2 className="text-xl font-semibold">{memories.length ? "No hay recuerdos con estos filtros" : "Aún no tienes recuerdos"}</h2>
        {!memories.length && <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Sube tu primera fotografía o video. También puedes añadir recuerdos de antes de llegar a PetCare.</p>}
      </div>
    )}
    <div className="columns-2 gap-4 md:columns-3 xl:columns-4 [&>*]:mb-4">
      {rows.map((m, i) => (
        <article key={m.id} className="card-soft group break-inside-avoid overflow-hidden">
          <button type="button" className="relative block w-full" onClick={() => setLightbox(i)} aria-label={`Abrir recuerdo: ${m.title}`}>
            {m.media_type === "video"
              ? <><video src={m.media_url} className="w-full object-cover" muted preload="metadata" /><span className="absolute top-2 left-2 grid size-8 place-items-center rounded-full bg-card/90 text-primary"><Film className="size-4" /></span></>
              : <img src={m.media_url} alt={m.title} loading="lazy" className="w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />}
            {m.favorite && <Star className="absolute top-2 right-2 size-5 fill-primary text-primary" />}
          </button>
          <div className="p-3">
            <h2 className="break-words text-sm font-semibold">{m.title}</h2>
            <p className="text-xs text-muted-foreground">{formatDay(m.memory_date)}</p>
            <div className="mt-1.5 flex flex-wrap gap-1">{m.pet_ids.map(id => <Pill_ key={id}>{petName(id, memorials)}</Pill_>)}</div>
          </div>
        </article>
      ))}
    </div>

    <Dialog open={current !== undefined} onOpenChange={o => { if (!o) setLightbox(null); }}>
      <DialogContent className="max-h-[92dvh] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-3xl">
        {current && <>
          <DialogTitle>{current.title}</DialogTitle>
          <DialogDescription>{formatDay(current.memory_date)}{current.album_id && ` · ${albums.find(a => a.id === current.album_id)?.name ?? ""}`}</DialogDescription>
          {current.media_type === "video"
            ? <video src={current.media_url} controls className="max-h-[55dvh] w-full rounded-2xl bg-muted" />
            : <img src={current.media_url} alt={current.title} className="max-h-[55dvh] w-full rounded-2xl object-contain bg-muted" />}
          {current.description && <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{current.description}</p>}
          <div className="flex flex-wrap gap-1.5">
            {current.pet_ids.map(id => {
              const demo = pets.find(p => p.id === id);
              return demo && !deceasedIds.has(id)
                ? <Link key={id} to="/mascotas/$petId" params={{ petId: id }}><Pill_>{demo.name}</Pill_></Link>
                : <Link key={id} to="/memoriam/$memorialId" params={{ memorialId: memorials.find(m => m.id === id || m.linked_pet_id === id)?.id ?? id }}><Pill_>{petName(id, memorials)} · In memoriam</Pill_></Link>;
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
            <div className="flex gap-1">
              <Button variant="outline" size="icon" disabled={lightbox === 0} aria-label="Recuerdo anterior" onClick={() => setLightbox(i => (i ?? 1) - 1)}><ChevronLeft /></Button>
              <Button variant="outline" size="icon" disabled={lightbox === rows.length - 1} aria-label="Recuerdo siguiente" onClick={() => setLightbox(i => (i ?? -1) + 1)}><ChevronRight /></Button>
            </div>
            <div className="flex flex-wrap gap-1">
              <Button variant="ghost" size="icon" title="Favorito" aria-label={`${current.favorite ? "Quitar de" : "Marcar como"} favorito`} onClick={() => void toggleFav(current)}><Star className={current.favorite ? "fill-primary text-primary" : ""} /></Button>
              <Button asChild variant="ghost" size="icon" title="Descargar"><a href={current.media_url} download target="_blank" rel="noreferrer" aria-label={`Descargar ${current.title}`}><Download /></a></Button>
              <Button variant="ghost" size="icon" title="Editar" aria-label={`Editar ${current.title}`} onClick={() => { setLightbox(null); open(current); }}><Pencil /></Button>
              <Button variant="ghost" size="icon" title="Eliminar" aria-label={`Eliminar ${current.title}`} onClick={() => setDeleting(current)}><Trash2 /></Button>
            </div>
          </div>
        </>}
      </DialogContent>
    </Dialog>

    <Dialog open={editing !== null} onOpenChange={o => { if (!o && !busy) setEditing(null); }}>
      <DialogContent className="max-h-[90dvh] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg">
        <DialogTitle>{editing === "new" ? "Añadir recuerdo" : "Editar recuerdo"}</DialogTitle>
        <DialogDescription>Una fotografía o video con su pequeña historia.</DialogDescription>
        <form className="grid gap-4" noValidate onSubmit={async e => {
          e.preventDefault();
          const values = { ...form, media_type: form.media_path ? mediaTypeOf(form.media_path) : form.media_type };
          const parsed = memorySchema.safeParse(values);
          if (!parsed.success) { setErrors(Object.fromEntries(parsed.error.issues.map(i => [String(i.path[0]), i.message]))); return; }
          setBusy(true);
          try {
            await fns.save({ data: { ...parsed.data, id: editing && editing !== "new" ? editing.id : undefined } });
            await cache.invalidateQueries({ queryKey: ["memories", user?.id] });
            setEditing(null); toast.success("Recuerdo guardado");
          } catch { toast.error("No se pudo guardar el recuerdo."); } finally { setBusy(false); }
        }}>
          <MediaField label="Fotografía o video" required url={preview} accept="image/*,video/*" onChange={(path, url) => { update("media_path", path ?? ""); setPreview(url); }} />
          {errors["media_path"] && <p className="text-xs text-primary" role="alert">Sube una fotografía o un video.</p>}
          <Field label="Título" maxLength={120} required value={form.title} error={errors["title"]} onChange={e => update("title", e.target.value)} />
          <Field label="Fecha del recuerdo" type="date" required value={form.memory_date} error={errors["memory_date"]} onChange={e => update("memory_date", e.target.value)} />
          <label className="grid gap-1.5 text-sm font-semibold">Pequeña historia (opcional)<textarea className={fieldClass} rows={3} maxLength={2000} value={form.description} onChange={e => update("description", e.target.value)} /></label>
          <PetChecks options={options} value={form.pet_ids} onChange={ids => update("pet_ids", ids)} />
          {errors["pet_ids"] && <p className="text-xs text-primary" role="alert">{errors["pet_ids"]}</p>}
          <label className="grid gap-1.5 text-sm font-semibold">Álbum (opcional)
            <select className={fieldClass} value={form.album_id ?? ""} onChange={e => update("album_id", e.target.value || null)}>
              <option value="">Sin álbum</option>{albums.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.favorite} onChange={e => update("favorite", e.target.checked)} />Marcar como favorito</label>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => setEditing(null)}>Cancelar</Button><Button type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar recuerdo"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>

    <AlbumsDialog open={albumsOpen} onClose={() => setAlbumsOpen(false)} albums={albums} busy={busy} setBusy={setBusy} onSave={async (values, id) => { setBusy(true); try { await fns.saveAlb({ data: { ...values, id } }); await cache.invalidateQueries({ queryKey: ["albums", user?.id] }); toast.success("Álbum guardado"); } catch { toast.error("No se pudo guardar el álbum."); } finally { setBusy(false); } }} onDelete={async id => { setBusy(true); try { await fns.removeAlb({ data: { id } }); await cache.invalidateQueries({ queryKey: ["albums", user?.id] }); toast.success("Álbum eliminado"); } catch { toast.error("No se pudo eliminar el álbum."); } finally { setBusy(false); } }} />
    {deleting && <DeleteDialog name={deleting.title} busy={busy} onCancel={() => setDeleting(null)} onConfirm={() => void confirmDelete()} />}
  </>;
}

function AlbumsDialog({ open, onClose, albums, busy, setBusy, onSave, onDelete }: {
  open: boolean; onClose: () => void; albums: Album[]; busy: boolean; setBusy: (b: boolean) => void;
  onSave: (values: AlbumInput, id?: string) => Promise<void>; onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState<Album | "new" | null>(null);
  const [form, setForm] = useState<AlbumInput>({ name: "", description: "" });
  const [error, setError] = useState("");
  return (
    <Dialog open={open} onOpenChange={o => { if (!o && !busy) { setEditing(null); onClose(); } }}>
      <DialogContent className="max-h-[90dvh] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-md">
        <DialogTitle>Mis álbumes</DialogTitle>
        <DialogDescription>Agrupa tus recuerdos como quieras.</DialogDescription>
        <ul className="space-y-2">
          {albums.map(a => (
            <li key={a.id} className="flex items-center gap-2 rounded-2xl border border-border bg-background/60 p-3">
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{a.name}</p>{a.description && <p className="truncate text-xs text-muted-foreground">{a.description}</p>}</div>
              <Button variant="ghost" size="icon" title="Editar álbum" aria-label={`Editar ${a.name}`} onClick={() => { setEditing(a); setForm({ name: a.name, description: a.description }); setError(""); }}><Pencil /></Button>
              <Button variant="ghost" size="icon" title="Eliminar álbum" aria-label={`Eliminar ${a.name}`} disabled={busy} onClick={() => void onDelete(a.id)}><Trash2 /></Button>
            </li>
          ))}
          {!albums.length && <li className="py-4 text-center text-sm text-muted-foreground">Aún no tienes álbumes.</li>}
        </ul>
        {editing === null
          ? <Button variant="outline" className="w-full" onClick={() => { setEditing("new"); setForm({ name: "", description: "" }); setError(""); }}><Plus />Crear álbum</Button>
          : <form className="grid gap-3 border-t border-border pt-4" noValidate onSubmit={async e => { e.preventDefault(); const parsed = albumSchema.safeParse(form); if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Revisa el formulario."); return; } await onSave(parsed.data, editing !== "new" ? editing.id : undefined); setEditing(null); }}>
              <Field label="Nombre del álbum" maxLength={80} required value={form.name} error={error} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Field label="Descripción (opcional)" maxLength={300} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => setEditing(null)}><X />Cancelar</Button><Button type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar"}</Button></div>
            </form>}
      </DialogContent>
    </Dialog>
  );
}
