import { type CareEvent, dayBefore } from "./progress-rules";
type Badge = { id: string; name: string; category: string; description: string; kind: string; target: number; metric?: "days" | "fullDays" | "tasks" | "vaccines" };
export const badges: Badge[] = [
  { id: "first-visit", name: "Primera visita", category: "Salud", description: "Asistir a una cita veterinaria.", kind: "appointment", target: 1 },
  { id: "vaccines", name: "Protección completa", category: "Salud", description: "Registrar todas las vacunas del calendario vigente de una mascota.", kind: "vaccine", target: 1, metric: "vaccines" },
  { id: "checkups", name: "Salud bajo control", category: "Salud", description: "Registrar cinco controles indicados por tu veterinario.", kind: "checkup", target: 5 },
  { id: "nutrition", name: "Nutrición responsable", category: "Alimentación", description: "Registrar alimentación durante siete días diferentes.", kind: "feeding", target: 7, metric: "days" },
  { id: "food30", name: "Rutina saludable", category: "Alimentación", description: "Completar treinta registros de alimentación.", kind: "feeding", target: 30 },
  { id: "walk1", name: "Primer paseo", category: "Actividad física", description: "Registrar un paseo realizado.", kind: "walk", target: 1 },
  { id: "walk10", name: "Explorador", category: "Actividad física", description: "Completar diez paseos.", kind: "walk", target: 10 },
  { id: "walk30", name: "Energía sin límites", category: "Actividad física", description: "Completar treinta actividades físicas.", kind: "walk", target: 30 },
  { id: "week", name: "Una semana de compromiso", category: "Constancia", description: "Completar todos los cuidados durante siete días consecutivos.", kind: "daily_bonus", target: 7, metric: "fullDays" },
  { id: "days30", name: "Cuidador constante", category: "Constancia", description: "Mantener treinta días consecutivos de actividad.", kind: "", target: 30, metric: "days" },
  { id: "tasks100", name: "Dedicación ejemplar", category: "Constancia", description: "Completar cien tareas de cuidado.", kind: "", target: 100, metric: "tasks" },
  { id: "profile", name: "Todo bajo control", category: "Organización", description: "Guardar información revisada del perfil de una mascota.", kind: "profile", target: 1 },
  { id: "agenda", name: "Agenda organizada", category: "Organización", description: "Registrar cinco citas programadas.", kind: "scheduled", target: 5 },
  { id: "history", name: "Historial completo", category: "Organización", description: "Guardar una actualización del historial médico.", kind: "history", target: 1 },
];
function longestRun(days: string[]) { const set = new Set(days); let max = 0; for (const day of set) { let n=0; let d=day; while(set.has(d)) { n++; d=dayBefore(d); } max=Math.max(max,n); } return max; }
export function badgeState(badge: Badge, events: CareEvent[], expectedVaccines: Record<string,string[]>, today: string) {
  const sorted = [...events].sort((a,b) => a.created_at.localeCompare(b.created_at));
  const count = (list: CareEvent[]) => {
    if (badge.metric === "vaccines") {
      return Object.entries(expectedVaccines).some(([pet, names]) => names.length > 0 && names.every(name => list.some(e => { const d = e.details as { nextDate?: string } | null; return e.pet_id===pet && e.kind==="vaccine" && e.title===name && !!d?.nextDate && d.nextDate >= today; }))) ? 1 : 0;
    }
    const relevant = list.filter(e => badge.kind ? e.kind === badge.kind : !["daily_bonus","weekly_bonus","scheduled","profile","history"].includes(e.kind));
    if (badge.metric === "fullDays" || (badge.metric === "days" && !badge.kind)) return longestRun(relevant.map(e=>e.date));
    if (badge.metric === "days") return new Set(relevant.map(e=>e.date)).size;
    return relevant.length;
  };
  const current = count(sorted); let obtained: string | null = null;
  if(current >= badge.target) { for(let i=0;i<sorted.length;i++) { if(count(sorted.slice(0,i+1)) >= badge.target) { obtained=sorted[i]?.created_at.slice(0,10) ?? null; break; } } }
  return { ...badge, current: Math.min(current,badge.target), unlocked: current>=badge.target, obtained };
}