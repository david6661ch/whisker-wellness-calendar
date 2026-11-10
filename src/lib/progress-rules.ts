import { z } from "zod";
export const activityKinds = ["task", "feeding", "walk", "hygiene", "appointment", "vaccine", "medication", "checkup", "profile", "history", "scheduled"] as const;
export type CareKind = typeof activityKinds[number];
export const scoring: Record<CareKind | "daily_bonus" | "weekly_bonus", number> = { task: 5, feeding: 5, walk: 10, hygiene: 15, appointment: 30, vaccine: 30, medication: 5, checkup: 30, profile: 5, history: 5, scheduled: 0, daily_bonus: 20, weekly_bonus: 50 };
export const kindNames: Record<CareKind | "daily_bonus" | "weekly_bonus", string> = { task: "Tarea diaria", feeding: "Alimentación", walk: "Paseo", hygiene: "Higiene", appointment: "Cita veterinaria realizada", vaccine: "Vacuna aplicada", medication: "Medicamento administrado", checkup: "Control veterinario", profile: "Perfil actualizado", history: "Historial actualizado", scheduled: "Cita programada", daily_bonus: "Todos los cuidados del día", weekly_bonus: "Una semana de cuidados" };
export const levels = [
  { name: "Nuevo cuidador", points: 0 }, { name: "Cuidador comprometido", points: 100 }, { name: "Cuidador responsable", points: 300 }, { name: "Experto en cuidados", points: 700 }, { name: "Guardián de mascotas", points: 1500 }, { name: "Protector excepcional", points: 3000 },
];
export const careSchema = z.object({
  kind: z.enum(activityKinds), petId: z.enum(["luna", "milo", "canela"]),
  sourceId: z.string().trim().max(120).regex(/^[a-zA-Z0-9:_-]*$/).default(""),
  title: z.string().trim().min(1, "Escribe qué cuidado realizaste.").max(120),
  notes: z.string().trim().max(1000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v, "Fecha inválida."),
  professional: z.string().trim().max(100), nextDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).or(z.literal("")),
  completed: z.literal(true, { errorMap: () => ({ message: "Confirma que el cuidado fue realizado." }) }),
}).superRefine((v, ctx) => {
  if (["appointment", "vaccine", "checkup"].includes(v.kind) && !v.professional) ctx.addIssue({ code: "custom", path: ["professional"], message: "Indica el veterinario o la clínica." });
  if (v.kind === "vaccine" && (!v.nextDate || v.nextDate <= v.date || Number.isNaN(Date.parse(v.nextDate)) || new Date(v.nextDate).toISOString().slice(0,10) !== v.nextDate)) ctx.addIssue({ code: "custom", path: ["nextDate"], message: "Indica la próxima dosis según tu veterinario." });
});
export type CareInput = z.infer<typeof careSchema>;
export type CareEvent = { id: string; pet_id: string | null; kind: string; title: string; points: number; date: string; created_at: string; details: unknown };
export const localDay = (date = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
export function levelProgress(total: number) {
  let index = 0; levels.forEach((l,i) => { if (total >= l.points) index = i; });
  const level = levels[index] ?? levels[0]; const next = levels[index + 1];
  return { index: index + 1, name: level?.name ?? "Nuevo cuidador", next: next?.name, remaining: next ? Math.max(0, next.points-total) : 0, percent: next ? Math.min(100, Math.round((total - (level?.points ?? 0)) / (next.points - (level?.points ?? 0)) * 100)) : 100 };
}
export function dayBefore(day: string) { const d = new Date(day + "T12:00:00Z"); d.setUTCDate(d.getUTCDate()-1); return d.toISOString().slice(0,10); }
export function streak(events: CareEvent[], today: string, fullDays = false) {
  const days = new Set(events.filter(e => fullDays ? e.kind === "daily_bonus" : e.points > 0 && !["daily_bonus", "weekly_bonus"].includes(e.kind)).map(e => e.date));
  let day = days.has(today) ? today : dayBefore(today); let count = 0;
  while (days.has(day)) { count++; day = dayBefore(day); } return count;
}