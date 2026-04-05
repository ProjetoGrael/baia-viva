-- Tornar o bucket community-photos público para exibir imagens
UPDATE storage.buckets SET public = true WHERE id = 'community-photos';

-- Política: qualquer autenticado pode fazer upload na pasta do seu user_id
CREATE POLICY "Users can upload their own photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'community-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política: leitura pública das fotos
CREATE POLICY "Public read access to community photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'community-photos');

-- Política: usuário pode deletar suas próprias fotos
CREATE POLICY "Users can delete their own photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'community-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
