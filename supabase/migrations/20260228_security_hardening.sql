-- Security hardening migration — 2026-02-28
-- Fixes duplicate RLS policies, hardens functions, locks down storage bucket.

-- ============================================================
-- 1. Fix save_beerdle_score: verify caller matches p_user_id
-- ============================================================
CREATE OR REPLACE FUNCTION public.save_beerdle_score(
  p_user_id uuid,
  p_game_date date,
  p_score integer
)
RETURNS TABLE(saved boolean, final_score integer, already_completed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  existing_score INTEGER;
BEGIN
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: user ID mismatch';
  END IF;

  SELECT score INTO existing_score
  FROM beerdle_scores
  WHERE user_id = p_user_id AND game_date = p_game_date;

  IF existing_score IS NOT NULL THEN
    RETURN QUERY SELECT false, existing_score, true;
  ELSE
    INSERT INTO beerdle_scores (user_id, game_date, score)
    VALUES (p_user_id, p_game_date, p_score);
    RETURN QUERY SELECT true, p_score, false;
  END IF;
END;
$function$;

-- ============================================================
-- 2. Fix scores INSERT policy: allow anonymous OR own user_id
-- ============================================================
DROP POLICY IF EXISTS "Enable insert for all users" ON scores;
DROP POLICY IF EXISTS "Anyone can insert scores" ON scores;
CREATE POLICY "Anyone can insert scores" ON scores
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- ============================================================
-- 3. Remove duplicate party_bus_players policies
-- ============================================================
DROP POLICY IF EXISTS "Enable delete access for all users" ON party_bus_players;
DROP POLICY IF EXISTS "Enable insert access for all users" ON party_bus_players;
DROP POLICY IF EXISTS "Enable read access for all users" ON party_bus_players;
DROP POLICY IF EXISTS "Enable update access for all users" ON party_bus_players;
DROP POLICY IF EXISTS "Players can delete themselves" ON party_bus_players;

-- Remaining policies after cleanup:
--   "Anyone can join as player"   INSERT  (anon, authenticated)  WITH CHECK (true)
--   "Anyone can remove players"   DELETE  (anon, authenticated)  USING (true)
--   "Anyone can update player state" UPDATE (anon, authenticated) USING/CHECK (true)
--   "Anyone can view players"     SELECT  (anon, authenticated)  USING (true)

-- ============================================================
-- 4. Remove duplicate party_bus_rooms policies
-- ============================================================
DROP POLICY IF EXISTS "Enable delete access for all users" ON party_bus_rooms;
DROP POLICY IF EXISTS "Enable insert access for all users" ON party_bus_rooms;
DROP POLICY IF EXISTS "Enable read access for all users" ON party_bus_rooms;
DROP POLICY IF EXISTS "Enable update access for all users" ON party_bus_rooms;

-- Remaining policies after cleanup:
--   "Anyone can create a room"  INSERT  (anon, authenticated)  WITH CHECK (true)
--   "Anyone can delete rooms"   DELETE  (anon, authenticated)  USING (true)
--   "Anyone can update rooms"   UPDATE  (anon, authenticated)  USING/CHECK (true)
--   "Anyone can view rooms"     SELECT  (anon, authenticated)  USING (true)

-- ============================================================
-- 5. Lock down avatars storage bucket
-- ============================================================
UPDATE storage.buckets
SET file_size_limit    = 2097152,  -- 2 MB
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/gif','image/webp']
WHERE id = 'avatars';

-- Storage RLS policies (already correct, documented here for reference):
--   "Anyone can view avatars"             SELECT  bucket_id = 'avatars'
--   "Users can upload their own avatar"   INSERT  bucket_id = 'avatars' AND auth.uid()::text = foldername(name)[1]
--   "Users can update their own avatar"   UPDATE  same check
--   "Users can delete their own avatar"   DELETE  same check

-- ============================================================
-- 6. Implement cleanup_old_rooms (was empty placeholder)
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_old_rooms()
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM party_bus_players
  WHERE room_id IN (
    SELECT id FROM party_bus_rooms
    WHERE created_at < NOW() - INTERVAL '24 hours'
  );

  DELETE FROM party_bus_rooms
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$function$;
