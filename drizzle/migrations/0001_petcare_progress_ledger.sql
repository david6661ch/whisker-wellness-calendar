CREATE TABLE public.care_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, pet_id text CHECK (pet_id IN ('luna','milo','canela')), kind text NOT NULL CHECK (kind IN ('task','feeding','walk','hygiene','appointment','vaccine','medication','checkup','profile','history','scheduled','daily_bonus','weekly_bonus')), source_key text NOT NULL CHECK (char_length(source_key) BETWEEN 1 AND 250), title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 120), points integer NOT NULL CHECK (points BETWEEN 0 AND 10000), date date NOT NULL, details jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id, source_key)
);
GRANT SELECT ON public.care_events TO authenticated;
GRANT ALL ON public.care_events TO service_role;
ALTER TABLE public.care_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY care_events_owner_read ON public.care_events FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
CREATE INDEX care_events_owner_date ON public.care_events(user_id,date);
CREATE FUNCTION public.record_care_event(p_user uuid, p_pet text, p_kind text, p_source text, p_title text, p_points integer, p_date date, p_details jsonb, p_daily_sources text[], p_daily_points integer, p_weekly_points integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE inserted_id uuid; bonus_id uuid; total_points integer := 0; run_days integer := 0; cursor_day date; completed_count integer;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 INSERT INTO public.care_events(user_id,pet_id,kind,source_key,title,points,date,details) VALUES(p_user,p_pet,p_kind,p_source,p_title,p_points,p_date,p_details) ON CONFLICT(user_id,source_key) DO NOTHING RETURNING id INTO inserted_id;
 IF inserted_id IS NULL THEN RETURN jsonb_build_object('duplicate',true,'points',0); END IF;
 total_points := p_points;
 SELECT count(*) INTO completed_count FROM public.care_events WHERE user_id=p_user AND source_key=ANY(p_daily_sources) AND date=p_date;
 IF cardinality(p_daily_sources)>0 AND completed_count=cardinality(p_daily_sources) THEN
  INSERT INTO public.care_events(user_id,kind,source_key,title,points,date) VALUES(p_user,'daily_bonus','daily:'||p_date,'Todos los cuidados del día',p_daily_points,p_date) ON CONFLICT(user_id,source_key) DO NOTHING RETURNING id INTO bonus_id;
  IF bonus_id IS NOT NULL THEN
   total_points:=total_points+p_daily_points; cursor_day:=p_date;
   LOOP
    EXIT WHEN NOT EXISTS(SELECT 1 FROM public.care_events WHERE user_id=p_user AND kind='daily_bonus' AND date=cursor_day);
    run_days:=run_days+1; cursor_day:=cursor_day-1;
   END LOOP;
   IF run_days>0 AND run_days%7=0 THEN
    INSERT INTO public.care_events(user_id,kind,source_key,title,points,date) VALUES(p_user,'weekly_bonus','weekly:'||p_date,'Una semana de cuidados',p_weekly_points,p_date) ON CONFLICT(user_id,source_key) DO NOTHING RETURNING id INTO bonus_id;
    IF bonus_id IS NOT NULL THEN total_points:=total_points+p_weekly_points; END IF;
   END IF;
  END IF;
 END IF;
 RETURN jsonb_build_object('duplicate',false,'points',total_points);
END $$;
REVOKE ALL ON FUNCTION public.record_care_event(uuid,text,text,text,text,integer,date,jsonb,text[],integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_care_event(uuid,text,text,text,text,integer,date,jsonb,text[],integer,integer) TO service_role;