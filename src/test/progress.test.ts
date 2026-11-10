import { describe,it,expect } from "vitest";
import { scoring,levelProgress,streak,careSchema,type CareEvent } from "@/lib/progress-rules";
import { badges,badgeState } from "@/lib/progress-badges";
const event=(kind:string,date:string,points=5):CareEvent=>({id:date,pet_id:"luna",kind,title:"Paseo",date,points,created_at:date+"T12:00:00Z",details:{}});
describe("Recompensas responsables",()=>{
  for(const [kind,points] of [["task",5],["walk",10],["hygiene",15],["appointment",30],["vaccine",30],["daily_bonus",20],["weekly_bonus",50]] as const) it(`recompensa ${kind} con ${points} puntos`,()=>{expect(scoring[kind]).toBe(points);});
  it("no premia una cita solo programada",()=>expect(scoring.scheduled).toBe(0));
  it("rechaza cuidados no confirmados",()=>expect(careSchema.safeParse({kind:"walk",petId:"luna",title:"Paseo",date:"2026-11-10",notes:"",professional:"",nextDate:"",completed:false}).success).toBe(false));
  it("exige profesional en cuidados médicos",()=>expect(careSchema.safeParse({kind:"appointment",petId:"luna",title:"Control",date:"2026-11-10",notes:"",professional:"",nextDate:"",completed:true}).success).toBe(false));
  it("no penaliza el nivel por días sin cuidados",()=>{expect(levelProgress(100).name).toBe("Cuidador comprometido");expect(levelProgress(99).index).toBe(1);});
  it("suma días únicos de racha, no clics",()=>{expect(streak([event("walk","2026-11-10"),event("feeding","2026-11-10"),event("walk","2026-11-09")],"2026-11-10")).toBe(2);});
  it("requiere siete días diferentes de alimentación",()=>{const b=badges.find(b=>b.id==="nutrition");if(!b)throw Error("Missing badge");expect(badgeState(b,Array.from({length:7},()=>event("feeding","2026-11-10")),{},"2026-11-10").unlocked).toBe(false);expect(badgeState(b,Array.from({length:7},(_,i)=>event("feeding",`2026-11-0${i+1}`)),{},"2026-11-10").unlocked).toBe(true);});
  it("solo desbloquea salud bajo control tras cinco controles",()=>{const b=badges.find(b=>b.id==="checkups");if(!b)throw Error("Missing badge");expect(badgeState(b,Array.from({length:4},(_,i)=>event("checkup",`2026-11-0${i+1}`)),{},"2026-11-10").unlocked).toBe(false);expect(badgeState(b,Array.from({length:5},(_,i)=>event("checkup",`2026-11-0${i+1}`)),{},"2026-11-10").unlocked).toBe(true);});
  it("protección completa requiere todas las vacunas vigentes",()=>{const b=badges.find(b=>b.id==="vaccines");if(!b)throw Error("Missing badge");const v={...event("vaccine","2026-11-10"),title:"Rabia",details:{nextDate:"2027-11-10"}};expect(badgeState(b,[v],{luna:["Rabia","Triple"]},"2026-11-10").unlocked).toBe(false);expect(badgeState(b,[v,{...v,title:"Triple"}],{luna:["Rabia","Triple"]},"2026-11-10").unlocked).toBe(true);});
});