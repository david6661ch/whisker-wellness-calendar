import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { VisitedPlace } from "@/lib/memories";

export default function PlacesMap({ places, picking, focus, onSelect, onPick }: {
  places: VisitedPlace[];
  picking?: boolean;
  focus?: { lat: number; lng: number } | null;
  onSelect: (id: string) => void;
  onPick?: (lat: number, lng: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const pickRef = useRef<L.Marker | null>(null);
  const cbRef = useRef({ onSelect, onPick });
  cbRef.current = { onSelect, onPick };

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { scrollWheelZoom: true }).setView([4.6, -74.08], 5);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    map.on("click", (e: L.LeafletMouseEvent) => cbRef.current.onPick?.(e.latlng.lat, e.latlng.lng));
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current; const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const bounds: [number, number][] = [];
    for (const p of places) {
      const icon = L.divIcon({
        className: "",
        html: '<div style="display:grid;place-items:center;width:32px;height:32px;border-radius:9999px;background:var(--primary);color:var(--primary-foreground);font-size:16px;box-shadow:0 2px 8px rgb(0 0 0 / 25%);border:2px solid var(--card)">🐾</div>',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([p.lat, p.lng], { icon, title: p.name, keyboard: true })
        .on("click", () => cbRef.current.onSelect(p.id))
        .addTo(layer);
      bounds.push([p.lat, p.lng]);
    }
    if (bounds.length) map.fitBounds(L.latLngBounds(bounds).pad(0.25), { maxZoom: 13 });
  }, [places]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (pickRef.current) { pickRef.current.remove(); pickRef.current = null; }
    map.getContainer().style.cursor = picking ? "crosshair" : "";
  }, [picking]);

  return <div ref={ref} className="h-[380px] w-full rounded-2xl border border-border md:h-[460px]" role="application" aria-label="Mapa interactivo de lugares visitados" />;
}
