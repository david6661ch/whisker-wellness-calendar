import { Suspense, Component, type ReactNode, type InputHTMLAttributes } from "react";
import { Link } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAccount } from "./AccountProvider";

export const fieldClass = "min-h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
export function Field({ label, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string | undefined }) {
  return <label className="grid gap-1.5 text-sm font-semibold">{label}<input {...props} className={fieldClass} aria-invalid={!!error} />{error && <span className="text-xs text-primary" role="alert">{error}</span>}</label>;
}
export function RecordsGate({ children }: { children: ReactNode }) {
  const { user, ready } = useAccount();
  if (!ready) return <p className="py-12 text-center text-muted-foreground">Cargando…</p>;
  if (!user) return <section className="flex flex-col items-center gap-4 border-y border-border py-16 text-center"><LockKeyhole className="size-9 text-primary" /><h2 className="text-xl font-semibold">Tus registros, solo para ti</h2><p className="text-muted-foreground">Inicia sesión para consultar y guardar tus contactos y gastos.</p><Button asChild><Link to="/auth" onClick={() => sessionStorage.setItem("care-return", window.location.pathname)}>Iniciar sesión</Link></Button></section>;
  return <RecordsError><Suspense fallback={<p className="py-12 text-center text-muted-foreground">Cargando registros…</p>}>{children}</Suspense></RecordsError>;
}
class RecordsError extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  override render() { return this.state.failed ? <div role="alert" className="py-12 text-center"><p>No pudimos cargar tus registros.</p><Button className="mt-4" onClick={() => window.location.reload()}>Reintentar</Button></div> : this.props.children; }
}
export function DeleteDialog({ name, busy, onCancel, onConfirm }: { name: string; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  return <Dialog open onOpenChange={open => { if (!open && !busy) onCancel(); }}><DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md"><DialogTitle>¿Eliminar este registro?</DialogTitle><DialogDescription>Se eliminará «{name}». Esta acción no se puede deshacer.</DialogDescription><div className="flex justify-end gap-2"><Button variant="outline" disabled={busy} onClick={onCancel}>Cancelar</Button><Button disabled={busy} onClick={onConfirm}>{busy ? "Eliminando…" : "Eliminar"}</Button></div></DialogContent></Dialog>;
}