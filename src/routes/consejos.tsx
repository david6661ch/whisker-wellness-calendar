import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, HeartHandshake, Lightbulb, ShieldAlert, Stethoscope } from "lucide-react";
import { PageHeader } from "@/components/petcare/ui";
import { adviceCategories } from "@/lib/owner-advice";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/consejos")({
  head: () => ({
    meta: [
      { title: "Consejos para dueños · PetCare" },
      { name: "description", content: "Cuidados básicos, advertencias y consejos responsables para quienes tienen una mascota por primera vez." },
      { property: "og:title", content: "Consejos para dueños · PetCare" },
      { property: "og:description", content: "Orientación sencilla para cuidar de tu mascota con confianza y responsabilidad." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OwnerAdvice,
});

const categoryIcons = {
  "primeros-cuidados": Lightbulb,
  advertencias: ShieldAlert,
  compromiso: HeartHandshake,
};

function OwnerAdvice() {
  return (
    <>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
        <BookOpen className="size-4" aria-hidden="true" /> Un buen comienzo juntos
      </div>
      <PageHeader title="Consejos para dueños" subtitle="El bienestar de tu mascota empieza con pequeños cuidados, cada día." />

      <aside className="mb-9 flex items-start gap-3 border-l-4 border-primary bg-secondary/60 px-4 py-3 text-sm text-secondary-foreground">
        <Stethoscope className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p>Estos consejos son orientación general y no sustituyen una consulta veterinaria. Ante una urgencia o una posible intoxicación, busca atención profesional de inmediato.</p>
      </aside>

      <div className="space-y-10">
        {adviceCategories.map((category) => {
          const Icon = categoryIcons[category.id];
          const warning = category.id === "advertencias";
          return (
            <section key={category.id} aria-labelledby={`${category.id}-title`}>
              <header className="mb-5 flex items-center gap-3">
                <span className={cn("grid size-11 shrink-0 place-items-center rounded-2xl", warning ? "bg-primary text-primary-foreground" : "bg-secondary text-primary")}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 id={`${category.id}-title`} className="text-xl font-semibold md:text-2xl">{category.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{category.subtitle}</p>
                </div>
              </header>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {category.items.map((item) => (
                  <article key={item.id} className={cn("card-soft p-5", warning && "border-l-4 border-l-primary bg-secondary/65")}>
                    {warning && <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-primary"><ShieldAlert className="size-3.5" aria-hidden="true" /> Atención</p>}
                    <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-foreground/85">{item.description}</p>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}