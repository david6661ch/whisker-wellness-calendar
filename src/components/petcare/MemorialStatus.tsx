import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Heart, Images, MapPin } from "lucide-react";
import { useAccount } from "./AccountProvider";
import { listMemorials } from "@/lib/memories.functions";

export function MemorialStatus({ petId }: { petId: string }) {
  const { user } = useAccount();
  const load = useServerFn(listMemorials);
  const { data } = useQuery({ queryKey: ["memorials", user?.id], queryFn: () => load(), enabled: !!user });
  const memorial = data?.find(m => m.linked_pet_id === petId);
  if (!memorial) return null;
  return (
    <section className="card-soft mb-6 flex flex-col gap-3 p-5 ring-1 ring-warm sm:flex-row sm:items-center" aria-label="Estado: en memoria">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-secondary text-primary"><Heart className="size-5" /></span>
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold">En memoria de {memorial.name}</h2>
        <p className="text-sm text-muted-foreground">Su perfil e historial se conservan; sus recordatorios ya no están activos.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to="/memoriam/$memorialId" params={{ memorialId: memorial.id }} className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground hover:bg-accent"><Heart className="size-3.5" />Ver memorial</Link>
        <Link to="/recuerdos" search={{ mascota: petId }} className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground hover:bg-accent"><Images className="size-3.5" />Recuerdos</Link>
        <Link to="/lugares" search={{ mascota: petId }} className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground hover:bg-accent"><MapPin className="size-3.5" />Lugares</Link>
      </div>
    </section>
  );
}
