import { useState } from "react";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "./AccountProvider";
import { fieldClass } from "./record-ui";
import type { PetRef } from "@/lib/memories";

export function MediaField({ label, url, accept, required, onChange }: {
  label: string; url: string | null; accept: string; required?: boolean;
  onChange: (path: string | null, previewUrl: string | null) => void;
}) {
  const { user } = useAccount();
  const [busy, setBusy] = useState(false);
  async function upload(file: File) {
    if (!user) return;
    if (file.size > 50 * 1024 * 1024) { toast.error("El archivo supera los 50 MB."); return; }
    setBusy(true);
    try {
      const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("memories").upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data: signed, error: signError } = await supabase.storage.from("memories").createSignedUrl(path, 3600);
      if (signError) throw signError;
      onChange(path, signed.signedUrl);
    } catch {
      toast.error("No se pudo subir el archivo.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="grid gap-1.5 text-sm font-semibold">
      <span>{label}{required && " *"}</span>
      {url ? (
        <div className="flex items-center gap-3">
          {accept.startsWith("video") ? <video src={url} className="size-20 rounded-xl object-cover ring-1 ring-border" muted /> : <img src={url} alt="" className="size-20 rounded-xl object-cover ring-1 ring-border" />}
          <Button type="button" variant="outline" size="sm" onClick={() => onChange(null, null)}><X />Quitar</Button>
        </div>
      ) : (
        <label className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-warm px-3 py-3 text-primary hover:bg-secondary ${busy ? "pointer-events-none opacity-60" : ""}`}>
          <ImagePlus className="size-5" />{busy ? "Subiendo…" : "Elegir archivo (máx. 50 MB)"}
          <input type="file" accept={accept} className="sr-only" disabled={busy} onChange={e => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ""; }} />
        </label>
      )}
    </div>
  );
}

export function PetChecks({ options, value, onChange }: { options: PetRef[]; value: string[]; onChange: (ids: string[]) => void }) {
  return (
    <fieldset className="grid gap-1.5 text-sm font-semibold">
      <legend className="mb-1">Mascotas</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <label key={o.id} className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${value.includes(o.id) ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-secondary-foreground ring-border"}`}>
            <input type="checkbox" className="sr-only" checked={value.includes(o.id)} onChange={e => onChange(e.target.checked ? [...value, o.id] : value.filter(v => v !== o.id))} />
            {o.name}{o.deceased && " · In memoriam"}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export { fieldClass };
