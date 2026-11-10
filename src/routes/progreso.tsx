import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/petcare/ui";
import { ProgressPanel } from "@/components/petcare/ProgressPanel";
import { pets } from "@/lib/petcare-data";
import { fieldClass } from "@/components/petcare/record-ui";
export const Route=createFileRoute("/progreso")({head:()=>({meta:[{title:"Mi progreso y logros · PetCare"},{name:"description",content:"Puntos, niveles e insignias por el cuidado responsable de tus mascotas."},{property:"og:title",content:"Mi progreso y logros · PetCare"},{property:"og:description",content:"Consulta tus hábitos, rachas y cuidados completados por mascota."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:ProgressPage});
function ProgressPage(){const [pet,setPet]=useState("");return <><PageHeader title="Mis logros" subtitle="Pequeños cuidados, un gran compromiso."/><label className="mb-6 grid max-w-xs gap-2 text-sm font-semibold">Progreso de<select className={fieldClass} value={pet} onChange={e=>setPet(e.target.value)}><option value="">Todas mis mascotas</option>{pets.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><ProgressPanel {...(pet?{petId:pet}:{})}/></>;}