CREATE TABLE public.private_settings (key text PRIMARY KEY, value text NOT NULL DEFAULT '', updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.private_settings TO authenticated;
GRANT ALL ON public.private_settings TO service_role;
ALTER TABLE public.private_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage private settings" ON public.private_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER private_settings_updated_at BEFORE UPDATE ON public.private_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();