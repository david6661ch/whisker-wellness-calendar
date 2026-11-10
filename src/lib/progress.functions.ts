import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { careSchema, scoring, localDay, type CareEvent } from "./progress-rules";
import { reminders, appointments, vaccines, getPet } from "./petcare-data";
export const getProgress = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const rows: CareEvent[] = [];
  for (let offset=0;;offset+=1000) {
    const { data,error } = await context.supabase.from("care_events").select("id,pet_id,kind,title,points,date,created_at,details").order("created_at").order("id").range(offset,offset+999);
    if(error) throw new Error("Impossible de cargar el progreso."); rows.push(...data); if(data.length<1000) break;
  }
  return rows;
});
export const recordCare = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(careSchema).handler(async ({ data,context }) => {
  const today=localDay();
  if(data.kind!=="scheduled" && data.date>today) throw new Error("El cuidado todavía no ha ocurrido.");
  if(!getPet(data.petId)) throw new Error("Mascota inválida.");
  let kind=data.kind; let title=data.title; let key=`${kind}:${data.petId}:${data.date}`;
  if(data.sourceId.startsWith("reminder:")) {
    const r=reminders.find(r=>`reminder:${r.id}`===data.sourceId && r.petId===data.petId);
    if(!r) throw new Error("Recordatorio inválido.");
    kind=({ Medicamento:"medication", Alimentación:"feeding", Actividad:"walk", Higiene:"hygiene", Vacuna:"vaccine" } as const)[r.category];
    if(data.kind!==kind) throw new Error("El cuidado no corresponde al recordatorio.");
    title=r.title; key=`reminder:${r.id}:${data.date}`;
    if(!r.when.startsWith("Hoy") && data.date===today) throw new Error("Este recordatorio no está programado para hoy; registra el cuidado desde Mi progreso cuando se realice.");
  } else if(data.sourceId.startsWith("appointment:")) {
    const a=appointments.find(a=>`appointment:${a.id}`===data.sourceId && a.petId===data.petId && a.type==="Veterinario");
    if(!a || data.kind!=="appointment") throw new Error("Cita inválida.");
    const scheduled=`2026-11-${a.day}`; if(data.date<scheduled) throw new Error("La cita todavía no ha ocurrido."); title=a.title; key=`appointment:${a.id}`;
  } else if(data.sourceId.startsWith("vaccine:")) {
    const name=data.sourceId.slice(7); const v=(vaccines[data.petId]??[]).find((_,i)=>String(i)===name);
    if(!v || kind!=="vaccine") throw new Error("Vacuna inválida."); title=v.name; key=`vaccine:${data.petId}:${name}:${data.date}`;
  } else if(data.sourceId) throw new Error("Origen inválido.");
  if(kind==="scheduled") key=`scheduled:${data.petId}:${data.date}:${title.toLocaleLowerCase()}`;
  if(kind==="profile" && data.notes.trim().length<10) throw new Error("Registra la información revisada del perfil.");
  if(kind==="history" && data.notes.trim().length<10) throw new Error("Registra la actualización del historial.");
  if(kind==="medication" && !getPet(data.petId)?.medications.length) throw new Error("No hay medicación indicada para esta mascota.");
  const daily=reminders.filter(r=>r.when.startsWith("Hoy")).map(r=>`reminder:${r.id}:${data.date}`);
  const { supabaseAdmin }=await import("@/integrations/supabase/client.server");
  const { data: result,error }=await supabaseAdmin.rpc("record_care_event", { p_user:context.userId,p_pet:data.petId,p_kind:kind,p_source:key,p_title:title,p_points:scoring[kind],p_date:data.date,p_details:{ notes:data.notes, professional:data.professional,nextDate:data.nextDate,sourceId:data.sourceId,completed:true },p_daily_sources:daily,p_daily_points:scoring.daily_bonus,p_weekly_points:scoring.weekly_bonus });
  if(error) throw new Error("No se pudo registrar el cuidado.");
  return result as { duplicate: boolean; points: number };
});