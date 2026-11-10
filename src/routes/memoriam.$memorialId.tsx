import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart, Images, MapPin } from "lucide-react";
import { PageHeader, Pill_, SectionCard } from "@/components/petcare/ui";
import { RecordsGate } from "@/components/petcare/record-ui";
import { ExperienciasNav } from "@/components/petcare/ExperienciasNav";
import { useAccount } from "@/components/petcare/AccountProvider";
import { formatDay, sharedTime, petName, type Memorial } from "@/lib/memories";
import { listMemorials, listMemories, listPlaces } from "@/lib/memories.functions";

export const Route = createFileRoute("/memoriam/$memorialId")({ head: () => ({ meta: [{ title: "Memorial · PetCare" }, { name: "description", content: "Un memorial privado para recordar a una mascota querida." }, { property: "og:title", content: "Memorial · PetCare" }, { property: "og:description", content: "Un memorial privado para recordar a una mascota querida." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" }] }), component: MemorialPage });

function MemorialPage() {
  return (
    <div className="care-palette">
      <ExperienciasNav />
      <RecordsGate><Detail /></RecordsGate>
    </div>
  );
}

function Detail() {
  const { memorialId } = Route.useParams();
  const { user } = useAccount();
  const loadMemorials = useServerFn(listMemorials); const loadMemories = useServerFn(listMemories); const loadPlaces = useServerFn(listPlaces);
  const { data: memorials } = useSuspenseQuery({ queryKey: ["memorials", user?.id], queryFn: () => loadMemorials() });
  const memorial: Memorial | undefined = memorials.find(m => m.id === memorialId);
  const { data: memories } = useSuspenseQuery({ queryKey: ["memories", user?.id], queryFn: () => loadMemories() });
  const { data: places } = useSuspenseQuery({ queryKey: ["places", user?.id], queryFn: () => loadPlaces() });
  if (!memorial) {
    return <div className="py-20 text-center"><p className="text-xl font-semibold">No encontramos este memorial.</p><Link to="/memoriam" className="mt-4 inline-block text-primary underline">Volver a In Memoriam</Link></div>;
  }
  const itsMemories = memories.filter(m => m.pet_ids.includes(memorial.id) || (memorial.linked_pet_id && m.pet_ids.includes(memorial.linked_pet_id)));
  const itsPlaces = places.filter(p => p.pet_ids.includes(memorial.id) || (memorial.linked_pet_id && p.pet_ids.includes(memorial.linked_pet_id)));
  const time = sharedTime(memorial.birth_date, memorial.death_date);
  return <>
    <Link to="/memoriam" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary"><ArrowLeft className="size-4" />In Memoriam</Link>
    <header className="card-soft relative mb-6 overflow-hidden p-6 md:p-8">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-warm opacity-70 md:h-28" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-end">
        {memorial.photo_url
          ? <img src={memorial.photo_url} alt={memorial.name} className="size-28 rounded-3xl object-cover ring-4 ring-card md:size-36" />
          : <span className="grid size-28 place-items-center rounded-3xl bg-secondary text-primary ring-4 ring-card md:size-36"><Heart className="size-10" /></span>}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-4xl font-semibold">{memorial.name}</h1>
            <Pill_>{memorial.species}</Pill_>{memorial.breed && <Pill_>{memorial.breed}</Pill_>}
          </div>
          <p className="mt-1 text-muted-foreground">{memorial.birth_date ? `${formatDay(memorial.birth_date)} — ` : ""}{formatDay(memorial.death_date)}</p>
          {time && <p className="mt-1 text-sm text-cocoa">{time}</p>}
        </div>
      </div>
      {memorial.dedication && <p className="relative mt-5 border-t border-border pt-4 text-center font-display text-lg italic text-cocoa">«{memorial.dedication}»</p>}
    </header>
    <div className="grid gap-6 lg:grid-cols-2">
      {memorial.bio && <SectionCard title="Su historia" icon={<Heart className="size-4" />}><p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{memorial.bio}</p></SectionCard>}
      {memorial.memories_text && <SectionCard title="Momentos especiales" icon={<Heart className="size-4" />}><p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{memorial.memories_text}</p></SectionCard>}
      <SectionCard title="Sus recuerdos" icon={<Images className="size-4" />} className="lg:col-span-2" action={<Link to="/recuerdos" search={{ mascota: memorial.linked_pet_id ?? memorial.id }} className="text-sm font-semibold text-primary hover:underline">Ver en la galería</Link>}>
        {itsMemories.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {itsMemories.map(m => (
              <li key={m.id}>
                <Link to="/recuerdos" search={{ mascota: m.pet_ids[0] ?? "" }} className="block overflow-hidden rounded-2xl ring-1 ring-border">
                  {m.media_type === "video" ? <video src={m.media_url} className="aspect-square w-full object-cover" muted /> : <img src={m.media_url} alt={m.title} loading="lazy" className="aspect-square w-full object-cover" />}
                </Link>
                <p className="mt-1 truncate text-xs font-semibold">{m.title}</p>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted-foreground">Aún no hay recuerdos asociados. Puedes añadirlos desde «Nuestros recuerdos» eligiendo a {memorial.name}.</p>}
      </SectionCard>
      <SectionCard title="Lugares que visitó" icon={<MapPin className="size-4" />} className="lg:col-span-2">
        {itsPlaces.length ? (
          <ul className="space-y-2">{itsPlaces.map(p => <li key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/60 p-3 text-sm"><span><strong>{p.name}</strong> · {p.category} · {formatDay(p.visit_date)}</span><span className="text-xs text-muted-foreground">{p.pet_ids.map(id => petName(id, memorials)).join(", ")}</span></li>)}</ul>
        ) : <p className="text-sm text-muted-foreground">Aún no hay lugares registrados con {memorial.name}.</p>}
      </SectionCard>
    </div>
  </>;
}
