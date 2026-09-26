<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Product photos live in the private `product-images` bucket; `image_url` stores `storage:<path>` and is served via `/api/public/product-image/$` (public buckets are blocked on this project).
- Admin CRUD uses the browser Supabase client with RLS gated by `has_role(auth.uid(),'admin')`; first admin is claimed via `claim_first_admin()` RPC.
- Meta Pixel ID is read from `store_settings.meta_pixel_id` at runtime by `StoreEffects` so admins can change it without redeploying.
