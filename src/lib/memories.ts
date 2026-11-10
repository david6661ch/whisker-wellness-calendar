import { z } from "zod";
import { pets } from "./petcare-data";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha.").refine(v => { const d = new Date(v + "T12:00:00Z"); return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v; }, "Fecha inválida.");
const pathSchema = z.string().trim().regex(/^[0-9a-f-]{36}\/[\w.,()-]{1,200}$/, "Archivo no válido.");
const petRefsSchema = z.array(z.string().trim().min(1).max(40)).max(12);

export const speciesList = ["Perro", "Gato", "Conejo", "Ave", "Hámster", "Otro"] as const;
export const placeCategories = ["Parques", "Restaurantes pet-friendly", "Cafeterías", "Hoteles", "Tiendas para mascotas", "Clínicas veterinarias", "Senderos y espacios naturales", "Otros lugares"] as const;

export const memorialSchema = z.object({
  linked_pet_id: z.enum(["luna", "milo", "canela"]).nullable(),
  name: z.string().trim().min(1, "Escribe su nombre.").max(80),
  species: z.string().trim().min(1, "Indica la especie.").max(60),
  breed: z.string().trim().max(80),
  birth_date: dateSchema.nullable(),
  death_date: dateSchema,
  bio: z.string().trim().max(2000),
  memories_text: z.string().trim().max(2000),
  dedication: z.string().trim().max(200),
  photo_path: pathSchema.nullable(),
  before_signup: z.boolean(),
});
export type MemorialInput = z.infer<typeof memorialSchema>;
export type Memorial = MemorialInput & { id: string; photo_url: string | null };

export const albumSchema = z.object({ name: z.string().trim().min(1, "Escribe el nombre del álbum.").max(80), description: z.string().trim().max(300) });
export type AlbumInput = z.infer<typeof albumSchema>;
export type Album = AlbumInput & { id: string };

export const memorySchema = z.object({
  title: z.string().trim().min(1, "Ponle un título al recuerdo.").max(120),
  description: z.string().trim().max(2000),
  memory_date: dateSchema,
  media_type: z.enum(["photo", "video"]),
  media_path: pathSchema,
  favorite: z.boolean(),
  album_id: z.string().uuid().nullable(),
  pet_ids: petRefsSchema,
});
export type MemoryInput = z.infer<typeof memorySchema>;
export type MemoryItem = MemoryInput & { id: string; media_url: string };

export const placeSchema = z.object({
  name: z.string().trim().min(1, "Escribe el nombre del lugar.").max(120),
  category: z.enum(placeCategories),
  address: z.string().trim().max(250),
  lat: z.coerce.number().finite().min(-90, "Latitud fuera de rango.").max(90, "Latitud fuera de rango."),
  lng: z.coerce.number().finite().min(-180, "Longitud fuera de rango.").max(180, "Longitud fuera de rango."),
  visit_date: dateSchema,
  pet_ids: petRefsSchema.min(1, "Elige al menos una mascota."),
  description: z.string().trim().max(2000),
  photo_path: pathSchema.nullable(),
  rating: z.number().int().min(1).max(5).nullable(),
  review: z.string().trim().max(2000),
  pet_friendly: z.boolean().nullable(),
  water_available: z.boolean().nullable(),
  good_treatment: z.boolean().nullable(),
  recommended: z.boolean().nullable(),
});
export type PlaceInput = z.infer<typeof placeSchema>;
export type VisitedPlace = PlaceInput & { id: string; photo_url: string | null };

export type PetRef = { id: string; name: string; deceased: boolean };
export function petOptions(memorials: Pick<Memorial, "id" | "name">[]): PetRef[] {
  const linked = new Set<string>();
  return [
    ...pets.map(p => ({ id: p.id, name: p.name, deceased: false })),
    ...memorials.map(m => ({ id: m.id, name: m.name, deceased: true })),
  ].filter(o => !linked.has(o.id) && !linked.add(o.id));
}
export function petName(id: string, memorials: Pick<Memorial, "id" | "name">[]): string {
  return pets.find(p => p.id === id)?.name ?? memorials.find(m => m.id === id)?.name ?? "Mascota";
}

export function formatDay(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "long" }).format(new Date(iso + "T12:00:00"));
}
export function sharedTime(birth: string | null, death: string): string | null {
  if (!birth) return null;
  const from = new Date(birth + "T12:00:00Z"); const to = new Date(death + "T12:00:00Z");
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to < from) return null;
  const days = Math.round((to.getTime() - from.getTime()) / 86400000);
  const years = Math.floor(days / 365); const months = Math.floor((days % 365) / 30);
  if (years > 0) return `${years} ${years === 1 ? "año" : "años"}${months ? ` y ${months} ${months === 1 ? "mes" : "meses"}` : ""} a tu lado`;
  if (months > 0) return `${months} ${months === 1 ? "mes" : "meses"} a tu lado`;
  return `${days} ${days === 1 ? "día" : "días"} a tu lado`;
}

export function placeStats(places: VisitedPlace[]) {
  const count = <K extends string>(pick: (p: VisitedPlace) => K | null) => {
    const tally = new Map<K, number>();
    for (const p of places) { const k = pick(p); if (k) tally.set(k, (tally.get(k) ?? 0) + 1); }
    return [...tally.entries()].sort((a, b) => b[1] - a[1]);
  };
  const cities = new Set(places.map(p => p.address.split(",").pop()?.trim().toLocaleLowerCase()).filter(Boolean));
  const byName = count(p => p.name.trim().toLocaleLowerCase());
  const byPet = new Map<string, number>();
  for (const p of places) for (const id of p.pet_ids) byPet.set(id, (byPet.get(id) ?? 0) + 1);
  const topPet = [...byPet.entries()].sort((a, b) => b[1] - a[1])[0];
  return {
    total: places.length,
    cities: cities.size,
    mostVisited: byName[0] && byName[0][1] > 1 ? { name: places.find(p => p.name.trim().toLocaleLowerCase() === byName[0][0])!.name, count: byName[0][1] } : null,
    topPet: topPet ? { id: topPet[0], count: topPet[1] } : null,
    categories: count(p => p.category),
  };
}
