DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Admins read product images" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Anyone can read settings" ON public.store_settings;
CREATE POLICY "Anyone can read public settings" ON public.store_settings FOR SELECT TO anon, authenticated
  USING (key IN ('meta_pixel_id', 'delivery_inside_dhaka', 'delivery_outside_dhaka'));

DROP POLICY IF EXISTS "Anyone can place an order" ON public.orders;
CREATE POLICY "Anyone can place a valid order" ON public.orders FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND payment_method IN ('cod', 'online')
    AND length(customer_name) BETWEEN 1 AND 120
    AND length(phone) BETWEEN 6 AND 20
    AND length(address) BETWEEN 3 AND 500
    AND (note IS NULL OR length(note) <= 1000)
    AND length(order_ref) BETWEEN 4 AND 30
    AND jsonb_typeof(items) = 'array'
    AND jsonb_array_length(items) BETWEEN 1 AND 50
    AND subtotal > 0 AND delivery_fee >= 0
    AND total = subtotal + delivery_fee
  );