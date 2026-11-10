CREATE TABLE public.emergency_contacts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid(), name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 100), phone text NOT NULL CHECK (phone ~ '^\+?[0-9 ()-]{7,25}$' AND char_length(regexp_replace(phone, '[^0-9]', '', 'g')) BETWEEN 7 AND 15), relationship text NOT NULL CHECK (char_length(btrim(relationship)) BETWEEN 1 AND 80), address text NOT NULL DEFAULT '' CHECK (char_length(address) <= 250), notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 1000), pet_id text CHECK (pet_id IN ('luna','milo','canela')), favorite boolean NOT NULL DEFAULT false, emergency boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_contacts TO authenticated;
GRANT ALL ON public.emergency_contacts TO service_role;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY contacts_owner ON public.emergency_contacts FOR ALL TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE INDEX contacts_owner_idx ON public.emergency_contacts(user_id);
CREATE TABLE public.pet_expenses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid(), description text NOT NULL CHECK (char_length(btrim(description)) BETWEEN 1 AND 120), category text NOT NULL CHECK (category IN ('Alimentación','Veterinario','Medicamentos','Higiene','Juguetes','Accesorios','Transporte','Otros')), pet_id text NOT NULL CHECK (pet_id IN ('luna','milo','canela')), amount numeric(14,2) NOT NULL CHECK (amount > 0 AND amount <= 999999999999.99), date date NOT NULL, notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 1000), created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pet_expenses TO authenticated;
GRANT ALL ON public.pet_expenses TO service_role;
ALTER TABLE public.pet_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY expenses_owner ON public.pet_expenses FOR ALL TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
CREATE INDEX expenses_owner_date_idx ON public.pet_expenses(user_id, date DESC);