CREATE TABLE public.memorial_pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  linked_pet_id text,
  name text NOT NULL,
  species text NOT NULL,
  breed text NOT NULL DEFAULT '',
  birth_date date,
  death_date date NOT NULL,
  bio text NOT NULL DEFAULT '',
  memories_text text NOT NULL DEFAULT '',
  dedication text NOT NULL DEFAULT '',
  photo_path text,
  before_signup boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memorial_pets TO authenticated;
GRANT ALL ON public.memorial_pets TO service_role;
ALTER TABLE public.memorial_pets ENABLE ROW LEVEL SECURITY;
CREATE POLICY memorials_owner ON public.memorial_pets FOR ALL TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

CREATE TABLE public.memory_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_albums TO authenticated;
GRANT ALL ON public.memory_albums TO service_role;
ALTER TABLE public.memory_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY albums_owner ON public.memory_albums FOR ALL TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

CREATE TABLE public.memory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  memory_date date NOT NULL,
  media_type text NOT NULL DEFAULT 'photo',
  media_path text NOT NULL,
  favorite boolean NOT NULL DEFAULT false,
  album_id uuid REFERENCES public.memory_albums(id) ON DELETE SET NULL,
  pet_ids text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_items TO authenticated;
GRANT ALL ON public.memory_items TO service_role;
ALTER TABLE public.memory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY memories_owner ON public.memory_items FOR ALL TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

CREATE TABLE public.visited_places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Otros lugares',
  address text NOT NULL DEFAULT '',
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  visit_date date NOT NULL,
  pet_ids text[] NOT NULL DEFAULT '{}',
  description text NOT NULL DEFAULT '',
  photo_path text,
  rating integer,
  review text NOT NULL DEFAULT '',
  pet_friendly boolean,
  water_available boolean,
  good_treatment boolean,
  recommended boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visited_places TO authenticated;
GRANT ALL ON public.visited_places TO service_role;
ALTER TABLE public.visited_places ENABLE ROW LEVEL SECURITY;
CREATE POLICY places_owner ON public.visited_places FOR ALL TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY memories_storage_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'memories' AND (storage.foldername(name))[1] = ((SELECT auth.uid()))::text);
CREATE POLICY memories_storage_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'memories' AND (storage.foldername(name))[1] = ((SELECT auth.uid()))::text);
CREATE POLICY memories_storage_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'memories' AND (storage.foldername(name))[1] = ((SELECT auth.uid()))::text) WITH CHECK (bucket_id = 'memories' AND (storage.foldername(name))[1] = ((SELECT auth.uid()))::text);
CREATE POLICY memories_storage_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'memories' AND (storage.foldername(name))[1] = ((SELECT auth.uid()))::text);