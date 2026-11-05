import luna from "@/assets/pet-luna.jpg";
import milo from "@/assets/pet-milo.jpg";
import canela from "@/assets/pet-canela.jpg";

export type Pet = {
  id: string;
  name: string;
  photo: string;
  species: string;
  breed: string;
  birthDate: string;
  age: string;
  weight: string;
  size: string;
  color: string;
  sex: string;
  microchip: string;
  personality: string[];
  notes: string;
  allergies: string[];
  medications: { name: string; dose: string; until: string }[];
  conditions: string[];
};

export const pets: Pet[] = [
  {
    id: "luna", name: "Luna", photo: luna, species: "Perro", breed: "Golden Retriever",
    birthDate: "12 mar 2021", age: "5 años", weight: "29,4 kg", size: "Grande", color: "Dorado",
    sex: "Hembra", microchip: "985 112 004 563 221",
    personality: ["Juguetona", "Sociable", "Glotona", "Le encanta nadar"],
    notes: "Tiene miedo a los fuegos artificiales. Prefiere paseos largos por la mañana.",
    allergies: ["Pollo"], conditions: ["Displasia leve de cadera"],
    medications: [{ name: "Condroprotector", dose: "1 tableta diaria", until: "30 dic 2026" }],
  },
  {
    id: "milo", name: "Milo", photo: milo, species: "Gato", breed: "Europeo atigrado",
    birthDate: "4 ago 2022", age: "4 años", weight: "5,1 kg", size: "Mediano", color: "Naranja atigrado",
    sex: "Macho", microchip: "985 112 007 118 940",
    personality: ["Tranquilo", "Curioso", "Independiente"],
    notes: "Bebe más agua de fuente. Esterilizado en 2023.",
    allergies: [], conditions: [], medications: [],
  },
  {
    id: "canela", name: "Canela", photo: canela, species: "Conejo", breed: "Holland Lop",
    birthDate: "20 ene 2024", age: "2 años", weight: "1,8 kg", size: "Pequeño", color: "Marrón y blanco",
    sex: "Hembra", microchip: "—",
    personality: ["Tímida", "Cariñosa", "Activa al atardecer"],
    notes: "Heno ilimitado. Revisar dientes cada 3 meses.",
    allergies: [], conditions: ["Sensibilidad dental"],
    medications: [{ name: "Probiótico", dose: "0,5 ml", until: "15 nov 2026" }],
  },
];

export const getPet = (id: string) => pets.find((p) => p.id === id);

export type Appointment = { id: string; petId: string; type: "Veterinario" | "Peluquería" | "Otro"; title: string; date: string; time: string; place: string; day: string; month: string };
export const appointments: Appointment[] = [
  { id: "a1", petId: "luna", type: "Veterinario", title: "Control de cadera", date: "8 nov 2026", day: "08", month: "NOV", time: "10:30", place: "Clínica Huellitas" },
  { id: "a2", petId: "milo", type: "Peluquería", title: "Corte de uñas y cepillado", date: "12 nov 2026", day: "12", month: "NOV", time: "16:00", place: "Pet Spa Aroma" },
  { id: "a3", petId: "canela", type: "Veterinario", title: "Revisión dental", date: "20 nov 2026", day: "20", month: "NOV", time: "09:00", place: "Exóticos Vet" },
  { id: "a4", petId: "luna", type: "Otro", title: "Clase de adiestramiento", date: "27 nov 2026", day: "27", month: "NOV", time: "18:00", place: "Parque El Virrey" },
];

export type ReminderCat = "Vacuna" | "Medicamento" | "Alimentación" | "Higiene" | "Actividad";
export type Reminder = { id: string; petId: string; category: ReminderCat; title: string; when: string; repeat: string; urgent?: boolean; done?: boolean };
export const reminders: Reminder[] = [
  { id: "r1", petId: "luna", category: "Medicamento", title: "Condroprotector", when: "Hoy · 08:00", repeat: "Diario", urgent: true },
  { id: "r2", petId: "milo", category: "Vacuna", title: "Refuerzo triple felina", when: "Mañana", repeat: "Anual", urgent: true },
  { id: "r3", petId: "canela", category: "Alimentación", title: "Verduras frescas", when: "Hoy · 18:00", repeat: "Diario" },
  { id: "r4", petId: "luna", category: "Higiene", title: "Baño y limpieza de oídos", when: "Sáb 9 nov", repeat: "Cada 2 semanas" },
  { id: "r5", petId: "milo", category: "Higiene", title: "Cambiar arena", when: "Hoy · 20:00", repeat: "Cada 2 días", done: true },
  { id: "r6", petId: "luna", category: "Actividad", title: "Paseo largo", when: "Hoy · 07:00", repeat: "Diario", done: true },
  { id: "r7", petId: "canela", category: "Medicamento", title: "Probiótico", when: "Hoy · 09:00", repeat: "Diario" },
];

export const vaccines: Record<string, { name: string; date: string; next: string; vet: string; status: "al día" | "próxima" | "vencida" }[]> = {
  luna: [
    { name: "Rabia", date: "15 mar 2026", next: "15 mar 2027", vet: "Dra. Pérez", status: "al día" },
    { name: "Polivalente (DHPPi+L)", date: "15 mar 2026", next: "15 mar 2027", vet: "Dra. Pérez", status: "al día" },
    { name: "Tos de las perreras", date: "2 dic 2025", next: "2 dic 2026", vet: "Dr. Gómez", status: "próxima" },
  ],
  milo: [
    { name: "Triple felina", date: "6 nov 2025", next: "6 nov 2026", vet: "Dra. Pérez", status: "próxima" },
    { name: "Rabia", date: "6 nov 2025", next: "6 nov 2026", vet: "Dra. Pérez", status: "próxima" },
  ],
  canela: [
    { name: "Mixomatosis", date: "10 feb 2026", next: "10 ago 2026", vet: "Dr. Ruiz", status: "vencida" },
    { name: "Enf. hemorrágica (RHD)", date: "10 feb 2026", next: "10 feb 2027", vet: "Dr. Ruiz", status: "al día" },
  ],
};

export const medicalVisits: Record<string, { date: string; reason: string; diagnosis: string; treatment: string; vet: string }[]> = {
  luna: [
    { date: "2 sep 2026", reason: "Cojera trasera", diagnosis: "Displasia leve de cadera", treatment: "Condroprotector y control de peso", vet: "Dr. Gómez · Clínica Huellitas" },
    { date: "15 mar 2026", reason: "Chequeo anual", diagnosis: "Saludable", treatment: "Vacunación anual", vet: "Dra. Pérez · Clínica Huellitas" },
    { date: "10 ene 2025", reason: "Picor en la piel", diagnosis: "Alergia alimentaria (pollo)", treatment: "Dieta hipoalergénica", vet: "Dra. Pérez · Clínica Huellitas" },
  ],
  milo: [{ date: "6 nov 2025", reason: "Chequeo anual", diagnosis: "Saludable", treatment: "Vacunación", vet: "Dra. Pérez · Clínica Huellitas" }],
  canela: [{ date: "10 ago 2026", reason: "Poco apetito", diagnosis: "Crecimiento dental irregular", treatment: "Limado dental y probiótico", vet: "Dr. Ruiz · Exóticos Vet" }],
};

export type Activity = { id: string; petId: string; kind: "salud" | "cita" | "peso" | "nota" | "vacuna"; title: string; detail: string; when: string };
export const activity: Activity[] = [
  { id: "e1", petId: "luna", kind: "peso", title: "Peso actualizado", detail: "29,4 kg (−0,6 kg)", when: "Hace 2 horas" },
  { id: "e2", petId: "milo", kind: "cita", title: "Cita agendada", detail: "Peluquería · 12 nov", when: "Ayer" },
  { id: "e3", petId: "canela", kind: "salud", title: "Medicamento iniciado", detail: "Probiótico por 3 meses", when: "Hace 3 días" },
  { id: "e4", petId: "luna", kind: "salud", title: "Visita veterinaria", detail: "Displasia leve de cadera", when: "2 sep" },
  { id: "e5", petId: "luna", kind: "nota", title: "Nueva nota", detail: "Primer día en la playa 🌊", when: "28 ago" },
  { id: "e6", petId: "milo", kind: "vacuna", title: "Vacuna aplicada", detail: "Triple felina", when: "6 nov 2025" },
  { id: "e7", petId: "luna", kind: "vacuna", title: "Vacuna aplicada", detail: "Rabia y polivalente", when: "15 mar" },
];
