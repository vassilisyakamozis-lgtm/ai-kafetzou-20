
-- 1) Enum για ρόλους
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('admin','moderator','user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2) Πίνακας profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  username text,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger function για updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger στο profiles
DROP TRIGGER IF EXISTS trg_profiles_set_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- RLS για profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Προβολή μόνο δικών μας records
DROP POLICY IF EXISTS "Profiles: select own" ON public.profiles;
CREATE POLICY "Profiles: select own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Δημιουργία μόνο για τον εαυτό μας
DROP POLICY IF EXISTS "Profiles: insert own" ON public.profiles;
CREATE POLICY "Profiles: insert own"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Ενημέρωση μόνο του δικού μας
DROP POLICY IF EXISTS "Profiles: update own" ON public.profiles;
CREATE POLICY "Profiles: update own"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Διαγραφή μόνο του δικού μας
DROP POLICY IF EXISTS "Profiles: delete own" ON public.profiles;
CREATE POLICY "Profiles: delete own"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- 3) Πίνακας user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.user_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS για user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Προβολή μόνο του δικού μας ρόλου
DROP POLICY IF EXISTS "UserRoles: select own" ON public.user_roles;
CREATE POLICY "UserRoles: select own"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Ορισμός/δημιουργία ρόλου μόνο για τον εαυτό μας (προαιρετικό - ανάλογα το use case)
DROP POLICY IF EXISTS "UserRoles: insert own" ON public.user_roles;
CREATE POLICY "UserRoles: insert own"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Ενημέρωση μόνο του δικού μας ρόλου
DROP POLICY IF EXISTS "UserRoles: update own" ON public.user_roles;
CREATE POLICY "UserRoles: update own"
  ON public.user_roles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Διαγραφή μόνο του δικού μας ρόλου
DROP POLICY IF EXISTS "UserRoles: delete own" ON public.user_roles;
CREATE POLICY "UserRoles: delete own"
  ON public.user_roles
  FOR DELETE
  USING (auth.uid() = user_id);
