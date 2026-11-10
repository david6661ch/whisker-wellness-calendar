import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contactSchema, expenseSchema } from "./care-records";

const idSchema = z.object({ id: z.string().uuid() });
export const listContacts = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await context.supabase.from("emergency_contacts").select("id,name,phone,relationship,address,notes,pet_id,favorite,emergency").order("created_at").order("id").range(offset, offset + 999);
    if (error) throw new Error("No se pudieron cargar los contactos.");
    rows.push(...data); if (data.length < 1000) break;
  }
  return rows.map(r => ({ ...r, pet_id: contactSchema.shape.pet_id.parse(r.pet_id) }));
});
export const saveContact = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(contactSchema.extend({ id: z.string().uuid().optional() })).handler(async ({ data, context }) => {
  const { id, ...values } = data;
  const result = id ? await context.supabase.from("emergency_contacts").update(values).eq("id", id).select("id").single() : await context.supabase.from("emergency_contacts").insert({ ...values, user_id: context.userId }).select("id").single();
  if (result.error) throw new Error("No se pudo guardar el contacto."); return result.data;
});
export const deleteContact = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(idSchema).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from("emergency_contacts").delete().eq("id", data.id).select("id").single(); if (error) throw new Error("No se pudo eliminar el contacto."); return { ok: true };
});
export const listExpenses = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await context.supabase.from("pet_expenses").select("id,description,category,pet_id,amount,date,notes").order("date", { ascending: false }).order("id").range(offset, offset + 999);
    if (error) throw new Error("No se pudieron cargar los gastos.");
    rows.push(...data); if (data.length < 1000) break;
  }
  return rows.map(r => ({ id: r.id, ...expenseSchema.parse(r) }));
});
export const saveExpense = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(expenseSchema.extend({ id: z.string().uuid().optional() })).handler(async ({ data, context }) => {
  const { id, ...values } = data;
  const result = id ? await context.supabase.from("pet_expenses").update(values).eq("id", id).select("id").single() : await context.supabase.from("pet_expenses").insert({ ...values, user_id: context.userId }).select("id").single();
  if (result.error) throw new Error("No se pudo guardar el gasto."); return result.data;
});
export const deleteExpense = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(idSchema).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from("pet_expenses").delete().eq("id", data.id).select("id").single(); if (error) throw new Error("No se pudo eliminar el gasto."); return { ok: true };
});