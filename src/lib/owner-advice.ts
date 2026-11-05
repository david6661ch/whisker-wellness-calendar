export type AdviceCategory = {
  id: "primeros-cuidados" | "advertencias" | "compromiso";
  title: string;
  subtitle: string;
  items: { id: string; title: string; description: string }[];
};

export const adviceCategories: AdviceCategory[] = [
  {
    id: "primeros-cuidados",
    title: "Consejos para nuevos dueños",
    subtitle: "Pequeños hábitos para empezar con buen pie.",
    items: [
      { id: "cuidado-diario", title: "Lo esencial, cada día", description: "Mantén agua fresca disponible, un espacio limpio y un lugar cómodo para descansar. Observa su apetito, ánimo y hábitos para reconocer cambios." },
      { id: "alimentacion", title: "Una rutina para comer", description: "Ofrece alimento adecuado para su especie, edad y necesidades en horarios regulares. Consulta al veterinario sobre las porciones y los cambios de dieta." },
      { id: "actividad", title: "Movimiento y juego", description: "Dedica tiempo diario al juego y a la actividad apropiada para su especie y condición. Los juegos de olfato y los juguetes seguros también estimulan su mente." },
      { id: "higiene", title: "Aseo sin excesos", description: "Mantén limpios su cama, comederos y zona de higiene. Adapta el cepillado, el baño y el cuidado dental a su especie con orientación profesional." },
      { id: "veterinario", title: "Su primera revisión", description: "Programa una revisión veterinaria y acuerda un calendario de controles preventivos. Lleva los registros de salud que tengas, aunque parezca estar bien." },
      { id: "adaptacion", title: "Un hogar, a su ritmo", description: "Prepara un refugio tranquilo y deja que explore poco a poco, sin forzar el contacto. Presenta personas y otros animales de forma gradual y supervisada." },
    ],
  },
  {
    id: "advertencias",
    title: "Advertencias",
    subtitle: "Riesgos que conviene reconocer a tiempo.",
    items: [
      { id: "toxicos", title: "No todo se puede compartir", description: "Chocolate, uvas, pasas, xilitol y algunos alimentos con cebolla o ajo pueden ser tóxicos para perros o gatos; también ciertos productos y plantas, como los lirios para gatos. Ante una posible ingestión tóxica, contacta de inmediato al veterinario y no provoques el vómito por tu cuenta." },
      { id: "alertas", title: "Señales que no deben esperar", description: "Dificultad para respirar, convulsiones, colapso o intentos de orinar sin lograrlo requieren atención veterinaria urgente. Consulta también si hay vómitos repetidos, falta de apetito o cambios persistentes de comportamiento." },
      { id: "medicacion", title: "Nunca automediques", description: "No administres medicamentos humanos ni reutilices tratamientos de otra mascota sin indicación veterinaria. Incluso productos habituales pueden causar intoxicaciones graves." },
      { id: "supervision", title: "Un entorno seguro", description: "Protege ventanas y balcones, guarda cables y sustancias peligrosas y supervisa el acceso al exterior. Nunca dejes a una mascota en un vehículo cerrado ni expuesta a temperaturas extremas." },
      { id: "prevencion", title: "Prevención al día", description: "Sigue el calendario de vacunas y control de parásitos indicado por su veterinario. Los productos y la frecuencia dependen de la especie, la edad y el entorno." },
    ],
  },
  {
    id: "compromiso",
    title: "Aspectos a tener en cuenta",
    subtitle: "Cuidar también es planificar a largo plazo.",
    items: [
      { id: "presupuesto", title: "Un presupuesto realista", description: "Considera alimentación, higiene, revisiones, vacunas y otros cuidados habituales. Reserva también un fondo para imprevistos veterinarios." },
      { id: "tiempo", title: "Tiempo todos los días", description: "Los cuidados, la compañía y la limpieza necesitan atención diaria. Organiza quién cuidará de tu mascota cuando viajes o no estés en casa." },
      { id: "especies", title: "Cada especie es distinta", description: "Un perro, un gato, un ave o un conejo no necesitan la misma dieta, espacio ni actividad. Infórmate sobre su especie y busca un veterinario con experiencia en ella." },
      { id: "socializacion", title: "Educar con paciencia", description: "Refuerza las conductas deseadas con premios apropiados y evita los castigos. Introduce nuevas experiencias de forma gradual, respetando sus señales de miedo o estrés." },
      { id: "largo-plazo", title: "Un compromiso de por vida", description: "Sus necesidades cambiarán con la edad y su salud. Planifica cómo mantener su bienestar durante todas las etapas de su vida." },
    ],
  },
];