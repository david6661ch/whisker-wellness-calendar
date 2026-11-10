import { z } from "zod";

export const categories = ["Alimentación", "Veterinario", "Medicamentos", "Higiene", "Juguetes", "Accesorios", "Transporte", "Otros"] as const;
export const petIdSchema = z.enum(["luna", "milo", "canela"]);
export const phoneSchema = z.string().trim().regex(/^\+?[0-9 ()-]{7,25}$/, "Introduce un teléfono válido.").refine(v => { const n = v.replace(/\D/g, "").length; return n >= 7 && n <= 15; }, "El teléfono debe tener entre 7 y 15 dígitos.");
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Escribe el nombre.").max(100), phone: phoneSchema,
  relationship: z.string().trim().min(1, "Indica la relación.").max(80),
  address: z.string().trim().max(250), notes: z.string().trim().max(1000),
  pet_id: petIdSchema.nullable(), favorite: z.boolean(), emergency: z.boolean(),
});
export const expenseSchema = z.object({
  description: z.string().trim().min(1, "Describe el gasto.").max(120), category: z.enum(categories),
  pet_id: petIdSchema, amount: z.coerce.number().finite().positive("El valor debe ser mayor que cero.").max(999999999999.99).refine(v => Math.abs(v * 100 - Math.round(v * 100)) < 0.01, "Usa máximo dos decimales."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha.").refine(v => { const d = new Date(v + "T12:00:00Z"); return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10) === v; }, "Fecha inválida."), notes: z.string().trim().max(1000),
});
export type ContactInput = z.infer<typeof contactSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type Contact = ContactInput & { id: string };
export type Expense = ExpenseInput & { id: string };
export const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 2 }).format(value);
export function telephoneHref(phone: string) { return `tel:${encodeURIComponent(phoneSchema.parse(phone).replace(/[ ()-]/g, ""))}`; }
export function filterExpenses(rows: Expense[], filters: { pet: string; category: string; from: string; to: string }) {
  return rows.filter(r => (!filters.pet || r.pet_id === filters.pet) && (!filters.category || r.category === filters.category) && (!filters.from || r.date >= filters.from) && (!filters.to || r.date <= filters.to));
}
export function expenseSummary(rows: Expense[], month: string) {
  const sum = (list: Expense[]) => Math.round(list.reduce((n,r) => n + Math.round(r.amount * 100), 0)) / 100;
  return { total: sum(rows), monthly: sum(rows.filter(r => r.date.startsWith(month))), categories: categories.map(category => ({ category, total: sum(rows.filter(r => r.category === category)) })).filter(r => r.total > 0) };
}