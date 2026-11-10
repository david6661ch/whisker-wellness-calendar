REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.care_events FROM authenticated, anon;
GRANT SELECT ON public.care_events TO authenticated;
GRANT ALL ON public.care_events TO service_role;