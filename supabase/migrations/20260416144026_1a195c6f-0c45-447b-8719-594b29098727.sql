
CREATE POLICY "Public insert services"
ON public.services
FOR INSERT
TO public
WITH CHECK (true);
