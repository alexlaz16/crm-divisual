-- ============================================================
-- EJECUTAR ESTE SQL EN: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tabla de perfiles con roles
CREATE TABLE IF NOT EXISTS public.profiles (
  id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email     text,
  full_name text,
  role      text NOT NULL DEFAULT 'vendedor' CHECK (role IN ('admin', 'vendedor')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Todos los usuarios autenticados pueden leer perfiles (para verificar roles)
CREATE POLICY "profiles_read" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Cada usuario puede insertar solo su propio perfil
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Solo admins pueden actualizar roles
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- 2. Trigger: crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    'vendedor'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Crear perfiles para usuarios ya existentes
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email,'@',1)),
  CASE WHEN email = 'alexlazcanoiam@gmail.com' THEN 'admin' ELSE 'vendedor' END
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  role = CASE
    WHEN EXCLUDED.email = 'alexlazcanoiam@gmail.com' THEN 'admin'
    ELSE profiles.role
  END,
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;
