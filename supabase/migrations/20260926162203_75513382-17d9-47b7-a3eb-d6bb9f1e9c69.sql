create policy "Admins delete orders"
on public.orders
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));