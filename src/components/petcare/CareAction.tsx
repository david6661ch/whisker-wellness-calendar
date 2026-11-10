import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Plus, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Field,fieldClass } from "./record-ui";
import { useAccount } from "./AccountProvider";
import { useProgress } from "./ProgressProvider";
import { recordCare } from "@/lib/progress.functions";
import { careSchema, localDay, kindNames, levelProgress, type CareKind } from "@/lib/progress-rules";
import { badges,badgeState } from "@/lib/progress-badges";
import { pets,vaccines } from "@/lib/petcare-data";
export function CareAction({kind,petId,sourceId="",title="",iconOnly=false,disabled=false,label="Registrar cuidado"}:{kind?:CareKind;petId?:string;sourceId?:string;title?:string;iconOnly?:boolean;disabled?:boolean;label?:string}) {
  const {user}=useAccount(); const {events,refresh}=useProgress(); const save=useServerFn(recordCare);
  const [open,setOpen]=useState(false); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  const [type,setType]=useState<CareKind>(kind??"walk"); const [pet,setPet]=useState(petId??"luna"); const [name,setName]=useState(title); const [date,setDate]=useState(localDay()); const [notes,setNotes]=useState(""); const [professional,setProfessional]=useState(""); const [nextDate,setNextDate]=useState(""); const [confirmed,setConfirmed]=useState(false);
  const done=events.some(e=>e.pet_id===pet && e.date===localDay() && (sourceId ? (e.details as {sourceId?:string}|null)?.sourceId===sourceId : e.kind===type));
  const medical=["appointment","vaccine","checkup","medication"].includes(type);
  return <><Button variant={iconOnly?"outline":"secondary"} size={iconOnly?"icon":"default"} disabled={disabled||done||busy} title={done?"Cuidado registrado":label} aria-label={done?`Completado: ${title}`:label} onClick={()=>{setOpen(true);setError("");setConfirmed(false);}}>{done?<Check />:iconOnly?<Check />:<Plus />}{!iconOnly && (done?"Registrado":label)}</Button>
    <Dialog open={open} onOpenChange={o=>{if(!busy)setOpen(o);}}><DialogContent className="max-h-[90dvh] max-w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg"><DialogTitle>{label}</DialogTitle><DialogDescription>{medical?"Registra únicamente cuidados realizados conforme a las indicaciones veterinarias.":"Confirma el cuidado realizado para tu mascota."}</DialogDescription>
      {!user?<div className="grid gap-4 py-4"><LockKeyhole className="text-primary" /><p>Inicia sesión para guardar tus cuidados y tu progreso.</p><Button asChild><Link to="/auth" onClick={()=>sessionStorage.setItem("care-return",window.location.pathname)}>Iniciar sesión</Link></Button></div>:<form className="grid gap-4" noValidate onSubmit={async e=>{
        e.preventDefault(); const parsed=careSchema.safeParse({kind:type,petId:pet,sourceId,title:name||kindNames[type],date,notes,professional,nextDate,completed:confirmed});
        if(!parsed.success){setError(parsed.error.issues[0]?.message??"Revisa los campos.");return;} setBusy(true);setError("");
        try { const before=levelProgress(events.reduce((n,r)=>n+r.points,0)); const result=await save({data:parsed.data}); if(result.duplicate){toast("Este cuidado ya está registrado; no se duplicaron los puntos.");} else {toast.success(result.points?`¡Cuidado registrado! +${result.points} puntos`:"Cita programada sin puntos de salud.");const next=await refresh() as {data?:typeof events};const fresh=next.data??events;const after=levelProgress(fresh.reduce((n,r)=>n+r.points,0));if(after.index>before.index)toast.success(`¡Felicidades! Eres ${after.name}.`);const expected=Object.fromEntries(pets.map(p=>[p.id,(vaccines[p.id]??[]).map(v=>v.name)]));for(const b of badges){if(!badgeState(b,events,expected,localDay()).unlocked&&badgeState(b,fresh,expected,localDay()).unlocked)toast.success(`¡Nueva insignia! ${b.name}`);}} await refresh();setOpen(false);
        }catch(err){setError(err instanceof Error?err.message:"No se pudo registrar el cuidado.");}finally{setBusy(false);}
      }}>
        {!kind&&<label className="grid gap-1 text-sm font-semibold">Actividad<select className={fieldClass} value={type} onChange={e=>setType(e.target.value as CareKind)}>{Object.entries(kindNames).filter(([k])=>!["daily_bonus","weekly_bonus"].includes(k)).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>}
        {!petId&&<label className="grid gap-1 text-sm font-semibold">Mascota<select className={fieldClass} value={pet} onChange={e=>setPet(e.target.value)}>{pets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}
        <Field label={type==="profile"?"Información revisada":"Nombre del cuidado"} value={name} maxLength={120} onChange={e=>setName(e.target.value)} readOnly={!!sourceId} />
        <Field label={type==="scheduled"?"Fecha de la cita":"Fecha de realización"} type="date" value={date} max={type==="scheduled"?undefined:localDay()} onChange={e=>setDate(e.target.value)} required />
        {["appointment","checkup","vaccine"].includes(type)&&<Field label="Veterinario o clínica" value={professional} maxLength={100} required onChange={e=>setProfessional(e.target.value)} />}
        {type==="vaccine"&&<Field label="Próxima dosis indicada" type="date" value={nextDate} required onChange={e=>setNextDate(e.target.value)} />}
        <label className="grid gap-1 text-sm font-semibold">{["profile","history"].includes(type)?"Información actualizada":"Observaciones"}<textarea className={fieldClass} rows={3} value={notes} maxLength={1000} onChange={e=>setNotes(e.target.value)} /></label>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} />{type==="scheduled"?"Confirmo que he programado esta cita.":"Confirmo que este cuidado ya fue realizado."}</label>{error&&<p role="alert" className="text-sm text-primary">{error}</p>}<Button type="submit" disabled={busy}>{busy?"Guardando…":"Guardar registro"}</Button>
      </form>}
    </DialogContent></Dialog></>;
}