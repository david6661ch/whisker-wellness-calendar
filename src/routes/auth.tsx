import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/petcare/record-ui";
import { useAccount } from "@/components/petcare/AccountProvider";
import { PageHeader } from "@/components/petcare/ui";

const schema = z.object({ email: z.string().trim().email("Introduce un correo válido.").max(255), password: z.string().min(8, "Usa al menos 8 caracteres.").max(128) });
export const Route = createFileRoute("/auth")({ head: () => ({ meta: [{ title: "Tu cuenta · PetCare" }, { name: "description", content: "Accede a tu cuenta para guardar contactos y gastos privados en PetCare." }, { property: "og:title", content: "Tu cuenta · PetCare" }, { property: "og:description", content: "Tus registros de cuidado, privados y siempre disponibles." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }), component: AuthPage });
function AuthPage() {
  const { user } = useAccount(); const navigate = useNavigate();
  const [signup, setSignup] = useState(false); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [busy, setBusy] = useState(false); const [notice, setNotice] = useState("");
  useEffect(() => { if (user) { const path = sessionStorage.getItem("care-return"); sessionStorage.removeItem("care-return"); void navigate({ to: path === "/gastos" ? "/gastos" : path === "/progreso" ? "/progreso" : path === "/recordatorios" ? "/recordatorios" : path === "/citas" ? "/citas" : path === "/" ? "/" : "/contactos", replace: true }); } }, [user, navigate]);
  async function social(provider: "google" | "lovable") { setBusy(true); setNotice(""); try { const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin + "/auth" }); if (result.error) setNotice("No se pudo iniciar sesión. Inténtalo nuevamente."); } catch { setNotice("No se pudo iniciar sesión."); } finally { setBusy(false); } }
  return <><PageHeader title={signup ? "Crea tu cuenta" : "Tu cuenta PetCare"} subtitle="Tus contactos y gastos, privados y a salvo." /><section className="mx-auto max-w-md py-6">
    <div className="grid gap-3"><Button variant="outline" className="google-auth-control h-11" disabled={busy} onClick={() => social("google")}><svg aria-hidden="true" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.61 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>Continuar con Google</Button><Button className="lovable-auth-button h-11 w-full" disabled={busy} onClick={() => social("lovable")}>Continue with Lovable</Button></div>
    <p className="my-5 text-center text-sm text-muted-foreground">o con tu correo</p>
    <form className="grid gap-4" noValidate onSubmit={async e => { e.preventDefault(); setNotice(""); const parsed = schema.safeParse({ email, password }); if (!parsed.success) { setNotice(parsed.error.issues[0]?.message ?? "Revisa los campos."); return; } setBusy(true); try { const result = signup ? await supabase.auth.signUp({ ...parsed.data, options: { emailRedirectTo: window.location.origin + "/auth" } }) : await supabase.auth.signInWithPassword(parsed.data); if (result.error) setNotice(signup ? "No se pudo crear la cuenta. Revisa tus datos e inténtalo nuevamente." : "No se pudo iniciar sesión. Revisa tu correo y contraseña."); else if (signup && !result.data.session) setNotice("Revisa tu correo para confirmar tu cuenta antes de iniciar sesión."); } catch { setNotice("No se pudo conectar. Inténtalo nuevamente."); } finally { setBusy(false); } }}>
      <Field label="Correo electrónico" type="email" autoComplete="email" maxLength={255} value={email} onChange={e => setEmail(e.target.value)} required /><Field label="Contraseña" type="password" autoComplete={signup ? "new-password" : "current-password"} minLength={8} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} required />
      {notice && <p className="text-sm text-primary" role="status">{notice}</p>}<Button type="submit" disabled={busy}>{busy ? "Un momento…" : signup ? "Crear cuenta" : "Iniciar sesión"}</Button>
    </form><Button variant="link" className="mt-4 w-full" onClick={() => { setSignup(v => !v); setNotice(""); }}>{signup ? "Ya tengo una cuenta" : "Crear una cuenta"}</Button>
  </section></>;
}