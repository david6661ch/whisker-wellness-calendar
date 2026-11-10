import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { memorialSchema, albumSchema, memorySchema, placeSchema } from "./memories";
import type { SupabaseClient } from "@supabase/supabase-js";

const idSchema = z.object({ id: z.string().uuid() });
const BUCKET = "memories";

async function signPaths(supabase: SupabaseClient, paths: (string | null)[]): Promise<Record<string, string>> {
  const unique = [...new Set(paths.filter((p): p is string => !!p))];
  if (!unique.length) return {};
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(unique, 3600);
  if (error) throw new Error("No se pudieron cargar los archivos.");
  return Object.fromEntries(data.map(d => [d.path, d.signedUrl]));
}
function ownPath(userId: string, path: string | null): string | null {
  if (path && !path.startsWith(`${userId}/`)) throw new Error("Archivo no válido.");
  return path;
}
async function removeFile(supabase: SupabaseClient, path: string | null) {
  if (path) await supabase.storage.from(BUCKET).remove([path]);
}

// ---------- In Memoriam ----------
export const listMemorials = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("memorial_pets").select("id,linked_pet_id,name,species,breed,birth_date,death_date,bio,memories_text,dedication,photo_path,before_signup").order("death_date", { ascending: false }).order("id");
  if (error) throw new Error("No se pudieron cargar los memoriales.");
  const urls = await signPaths(context.supabase, data.map(m => m.photo_path));
  return data.map(m => ({ ...m, photo_url: m.photo_path ? (urls[m.photo_path] ?? null) : null }));
});
export const saveMemorial = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(memorialSchema.extend({ id: z.string().uuid().optional() })).handler(async ({ data, context }) => {
  const { id, ...values } = data;
  values.photo_path = ownPath(context.userId, values.photo_path);
  if (values.birth_date && values.birth_date > values.death_date) throw new Error("La fecha de nacimiento debe ser anterior a la de fallecimiento.");
  const result = id
    ? await context.supabase.from("memorial_pets").update(values).eq("id", id).select("id").single()
    : await context.supabase.from("memorial_pets").insert({ ...values, user_id: context.userId }).select("id").single();
  if (result.error) throw new Error("No se pudo guardar el memorial."); return result.data;
});
export const deleteMemorial = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(idSchema).handler(async ({ data, context }) => {
  const { data: row, error } = await context.supabase.from("memorial_pets").delete().eq("id", data.id).select("photo_path").single();
  if (error) throw new Error("No se pudo eliminar el memorial.");
  await removeFile(context.supabase, row.photo_path);
  return { ok: true };
});

// ---------- Álbumes ----------
export const listAlbums = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("memory_albums").select("id,name,description").order("name").order("id");
  if (error) throw new Error("No se pudieron cargar los álbumes.");
  return data;
});
export const saveAlbum = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(albumSchema.extend({ id: z.string().uuid().optional() })).handler(async ({ data, context }) => {
  const { id, ...values } = data;
  const result = id
    ? await context.supabase.from("memory_albums").update(values).eq("id", id).select("id").single()
    : await context.supabase.from("memory_albums").insert({ ...values, user_id: context.userId }).select("id").single();
  if (result.error) throw new Error("No se pudo guardar el álbum."); return result.data;
});
export const deleteAlbum = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(idSchema).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from("memory_albums").delete().eq("id", data.id).select("id").single();
  if (error) throw new Error("No se pudo eliminar el álbum."); return { ok: true };
});

// ---------- Recuerdos ----------
export const listMemories = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("memory_items").select("id,title,description,memory_date,media_type,media_path,favorite,album_id,pet_ids").order("memory_date", { ascending: false }).order("id");
  if (error) throw new Error("No se pudieron cargar los recuerdos.");
  const urls = await signPaths(context.supabase, data.map(m => m.media_path));
  return data.map(m => ({ ...m, media_url: urls[m.media_path] ?? "" }));
});
export const saveMemory = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(memorySchema.extend({ id: z.string().uuid().optional() })).handler(async ({ data, context }) => {
  const { id, ...values } = data;
  values.media_path = ownPath(context.userId, values.media_path)!;
  if (values.album_id) {
    const { data: album } = await context.supabase.from("memory_albums").select("id").eq("id", values.album_id).maybeSingle();
    if (!album) throw new Error("El álbum seleccionado no existe.");
  }
  const result = id
    ? await context.supabase.from("memory_items").update(values).eq("id", id).select("id").single()
    : await context.supabase.from("memory_items").insert({ ...values, user_id: context.userId }).select("id").single();
  if (result.error) throw new Error("No se pudo guardar el recuerdo."); return result.data;
});
export const deleteMemory = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(idSchema).handler(async ({ data, context }) => {
  const { data: row, error } = await context.supabase.from("memory_items").delete().eq("id", data.id).select("media_path").single();
  if (error) throw new Error("No se pudo eliminar el recuerdo.");
  await removeFile(context.supabase, row.media_path);
  return { ok: true };
});

// ---------- Lugares visitados ----------
export const listPlaces = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from("visited_places").select("id,name,category,address,lat,lng,visit_date,pet_ids,description,photo_path,rating,review,pet_friendly,water_available,good_treatment,recommended").order("visit_date", { ascending: false }).order("id");
  if (error) throw new Error("No se pudieron cargar los lugares.");
  const urls = await signPaths(context.supabase, data.map(p => p.photo_path));
  return data.map(p => ({ ...p, photo_url: p.photo_path ? (urls[p.photo_path] ?? null) : null }));
});
export const savePlace = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(placeSchema.extend({ id: z.string().uuid().optional() })).handler(async ({ data, context }) => {
  const { id, ...values } = data;
  values.photo_path = ownPath(context.userId, values.photo_path);
  const result = id
    ? await context.supabase.from("visited_places").update(values).eq("id", id).select("id").single()
    : await context.supabase.from("visited_places").insert({ ...values, user_id: context.userId }).select("id").single();
  if (result.error) throw new Error("No se pudo guardar el lugar."); return result.data;
});
export const deletePlace = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(idSchema).handler(async ({ data, context }) => {
  const { data: row, error } = await context.supabase.from("visited_places").delete().eq("id", data.id).select("photo_path").single();
  if (error) throw new Error("No se pudo eliminar el lugar.");
  await removeFile(context.supabase, row.photo_path);
  return { ok: true };
});
