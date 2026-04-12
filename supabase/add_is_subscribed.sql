-- Migration : ajouter is_subscribed à la table profiles
-- À exécuter dans Supabase Dashboard → SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_subscribed BOOLEAN NOT NULL DEFAULT false;

-- Protéger le champ : seul le service role peut le modifier
-- (le user connecté via anon key ne peut PAS s'auto-abonner)
-- La RLS existante sur profiles doit déjà couvrir les SELECTs.
-- On ajoute une policy restrictive pour les UPDATEs sur ce champ :

CREATE POLICY "only_service_role_can_set_subscribed"
  ON profiles
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (
    -- Interdit la modification de is_subscribed côté client
    is_subscribed = (SELECT is_subscribed FROM profiles WHERE id = auth.uid())
  );
