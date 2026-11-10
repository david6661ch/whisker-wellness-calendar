import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Plus, Phone, Star, Pencil, Trash2, MapPin, ShieldPlus, Search, PawPrint } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader } from "@/components/petcare/ui";
import { RecordsGate, Field, fieldClass, DeleteDialog } from "@/components/petcare/record-ui";
import { useAccount } from "@/components/petcare/AccountProvider";
import { contactSchema, telephoneHref, type Contact, type ContactInput } from "@/lib/care-records";
import { listContacts, saveContact, deleteContact } from "@/lib/care-records.functions";
import { pets } from "@/lib/petcare-data";

export const Route = createFileRoute("/contactos")({ head: () => ({ meta: [{ title: "Contactos de emergencia · PetCare" }, { name: "description", content: "Tus contactos prioritarios para el cuidado y las emergencias de tus mascotas." }, { property: "og:title", content: "Contactos de emergencia · PetCare" }, { property: "og:description", content: "Encuentra rápidamente tus contactos veterinarios y de confianza." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: ContactsPage });
function ContactsPage() { return <><PageHeader title="Contactos de emergencia" subtitle="Ayuda de confianza, siempre a mano." /><RecordsGate><Contacts /></RecordsGate></>; }
const empty: ContactInput = { name: "", phone: "", relationship: "Veterinario", address: "", notes: "", pet_id: null, favorite: false, emergency: false };
function Contacts() {
  const { user } = useAccount(); const cache = useQueryClient(); const load = useServerFn(listContacts); const save = useServerFn(saveContact); const remove = useServerFn(deleteContact);
  const key = ["contacts", user?.id]; const { data } = useSuspenseQuery({ queryKey: key, queryFn: () => load() });
  const [search, setSearch] = useState(""); const [onlyFavorites, setOnlyFavorites] = useState(false); const [onlyEmergency, setOnlyEmergency] = useState(false);
  const [editing, setEditing] = useState<Contact | "new" | null>(null); const [deleting, setDeleting] = useState<Contact | null>(null); const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<ContactInput>(empty); const [errors, setErrors] = useState<Record<string,string>>({});
  const update = <K extends keyof ContactInput>(k: K, value: ContactInput[K]) => setForm(f => ({ ...f, [k]: value }));
  const open = (contact?: Contact) => { setEditing(contact ?? "new"); setForm(contact ?? empty); setErrors({}); };
  async function persist(values: ContactInput, id?: string, close = false) { setBusy(true); try { await save({ data: { ...values, id } }); await cache.invalidateQueries({ queryKey: key }); if (close) setEditing(null); toast.success("Contacto guardado"); } catch { toast.error("No se pudo guardar el contacto. Inténtalo de nuevo."); } finally { setBusy(false); } }
  const rows = data.filter(c => (!onlyFavorites || c.favorite) && (!onlyEmergency || c.emergency) && `${c.name} ${c.relationship} ${c.phone}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())).sort((a,b) => Number(b.favorite) - Number(a.favorite) || Number(b.emergency) - Number(a.emergency) || a.name.localeCompare(b.name));
  return <>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldPlus className="size-5 text-primary" />{data.length} contactos · {data.filter(c => c.emergency).length} de emergencia</div><Button onClick={() => open()} className="rounded-full"><Plus />Añadir contacto</Button></div>
    <div className="mb-6 flex flex-wrap gap-3"><label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-card px-3"><Search className="size-4 shrink-0 text-muted-foreground" /><input aria-label="Buscar contactos" maxLength={100} value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar contacto…" className="min-h-11 w-full min-w-0 bg-transparent text-sm outline-none" /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyFavorites} onChange={e => setOnlyFavorites(e.target.checked)} />Favoritos</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyEmergency} onChange={e => setOnlyEmergency(e.target.checked)} />Emergencias veterinarias</label></div>
    {!rows.length && <div className="border-y border-border py-16 text-center"><Phone className="mx-auto mb-4 size-9 text-primary" /><h2 className="text-xl font-semibold">{data.length ? "No hay contactos con estos filtros" : "Aún no tienes contactos"}</h2></div>}
    <div className="grid gap-4 md:grid-cols-2">{rows.map(c => <article key={c.id} className="card-soft flex min-w-0 flex-col gap-4 p-5">
      <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">{c.emergency ? <ShieldPlus /> : <Phone />}</span><div className="min-w-0 flex-1"><h2 className="break-words text-xl font-semibold">{c.name}</h2><p className="break-words text-sm text-muted-foreground">{c.relationship}</p></div><Button variant="ghost" size="icon" disabled={busy} aria-label={`${c.favorite ? "Quitar de" : "Marcar como"} favorito: ${c.name}`} title="Favorito" onClick={() => persist({ ...c, favorite: !c.favorite }, c.id)}><Star className={c.favorite ? "fill-primary text-primary" : "text-muted-foreground"} /></Button></div>
      {c.emergency && <p className="flex items-center gap-2 text-sm font-bold text-primary"><ShieldPlus className="size-4" />Atención veterinaria de emergencia</p>}
      {c.address && <p className="flex items-start gap-2 break-words text-sm text-muted-foreground"><MapPin className="mt-0.5 size-4 shrink-0" />{c.address}</p>}
      {c.pet_id && <p className="flex items-center gap-2 text-sm text-primary"><PawPrint className="size-4" />{pets.find(p => p.id === c.pet_id)?.name}</p>}
      {c.notes && <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{c.notes}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-4"><Button asChild className="mr-auto rounded-full"><a href={telephoneHref(c.phone)}><Phone />{c.phone}</a></Button><Button variant="ghost" size="icon" title="Editar contacto" aria-label={`Editar ${c.name}`} onClick={() => open(c)}><Pencil /></Button><Button variant="ghost" size="icon" title="Eliminar contacto" aria-label={`Eliminar ${c.name}`} onClick={() => setDeleting(c)}><Trash2 /></Button></div>
    </article>)}</div>
    <Dialog open={editing !== null} onOpenChange={o => { if (!o && !busy) setEditing(null); }}><DialogContent className="max-h-[90dvh] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg"><DialogTitle>{editing === "new" ? "Añadir contacto" : "Editar contacto"}</DialogTitle><DialogDescription>Información de tu contacto de confianza.</DialogDescription><form className="grid gap-4" noValidate onSubmit={e => { e.preventDefault(); const result = contactSchema.safeParse(form); if (!result.success) { setErrors(Object.fromEntries(result.error.issues.map(i => [i.path[0], i.message]))); return; } void persist(result.data, editing && editing !== "new" ? editing.id : undefined, true); }}>
      <Field label="Nombre completo" value={form.name} maxLength={100} error={errors.name} onChange={e => update("name", e.target.value)} required />
      <Field label="Número de teléfono" type="tel" value={form.phone} maxLength={25} error={errors.phone} onChange={e => update("phone", e.target.value)} required />
      <Field label="Relación" value={form.relationship} maxLength={80} error={errors.relationship} onChange={e => update("relationship", e.target.value)} list="relationships" required /><datalist id="relationships">{["Veterinario", "Clínica veterinaria", "Familiar", "Cuidador", "Otro"].map(r => <option key={r}>{r}</option>)}</datalist>
      <label className="grid gap-1.5 text-sm font-semibold">Mascota<select className={fieldClass} value={form.pet_id ?? ""} onChange={e => update("pet_id", contactSchema.shape.pet_id.parse(e.target.value || null))}><option value="">Todas mis mascotas</option>{pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      <Field label="Dirección (opcional)" value={form.address} maxLength={250} onChange={e => update("address", e.target.value)} />
      <label className="grid gap-1.5 text-sm font-semibold">Observaciones (opcional)<textarea className={fieldClass} value={form.notes} maxLength={1000} rows={3} onChange={e => update("notes", e.target.value)} /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.favorite} onChange={e => update("favorite", e.target.checked)} />Contacto favorito o prioritario</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.emergency} onChange={e => update("emergency", e.target.checked)} />Atención veterinaria de emergencia</label>
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" disabled={busy} onClick={() => setEditing(null)}>Cancelar</Button><Button type="submit" disabled={busy}>{busy ? "Guardando…" : "Guardar contacto"}</Button></div>
    </form></DialogContent></Dialog>
    {deleting && <DeleteDialog name={deleting.name} busy={busy} onCancel={() => setDeleting(null)} onConfirm={async () => { setBusy(true); try { await remove({ data: { id: deleting.id } }); await cache.invalidateQueries({ queryKey: key }); setDeleting(null); toast.success("Contacto eliminado"); } catch { toast.error("No se pudo eliminar el contacto."); } finally { setBusy(false); } }} />}
  </>;
}
