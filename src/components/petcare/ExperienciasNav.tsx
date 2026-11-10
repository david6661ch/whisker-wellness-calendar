import { Link } from "@tanstack/react-router";
import { Images, MapPin, Heart } from "lucide-react";

const items = [
  { to: "/recuerdos", label: "Nuestros recuerdos", icon: Images },
  { to: "/lugares", label: "Lugares visitados", icon: MapPin },
  { to: "/memoriam", label: "In Memoriam", icon: Heart },
] as const;

export function ExperienciasNav() {
  return (
    <nav aria-label="Experiencias" className="mb-6 flex gap-2 overflow-x-auto pb-1">
      {items.map(item => (
        <Link key={item.to} to={item.to} className="flex shrink-0 items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold text-secondary-foreground ring-1 ring-border hover:bg-secondary" activeProps={{ className: "!bg-primary !text-primary-foreground" }}>
          <item.icon className="size-4" />{item.label}
        </Link>
      ))}
    </nav>
  );
}
