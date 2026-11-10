<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project conventions
- Keep owner-advice content in a browser-safe typed catalog separate from its route so categories can grow without changing the page layout.
- Expose owner advice through the shared header while preserving the existing primary and mobile navigation destinations.
- Store contacts and expenses as user-owned Cloud records; validate mutations with shared Zod schemas on both sides and enforce owner-only RLS to keep private records isolated.
- Keep the existing demo pet catalog as the source of pet identifiers for new records; do not migrate or alter the existing demo workflows as part of these additions.
- Keep new record pages public with an inline sign-in state; private queries mount only after account hydration, and protected server functions always revalidate the bearer.
- Compute expense totals in integer cents over paginated records so filters and summaries remain accurate beyond the Data API row limit.
- Keep scoring, levels and badge conditions in browser-safe catalogs, with authenticated completion validation on the server and an atomic, service-only ledger RPC; clients cannot write points or bypass unique reward keys.
- Do not import historical demo activity into the reward ledger; each new completed care record is explicit, owner-scoped and separate from the demo medical history.
