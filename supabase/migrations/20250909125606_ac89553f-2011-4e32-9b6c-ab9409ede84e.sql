-- Remove public read access from users table
DROP POLICY IF EXISTS "anon read users" ON public.users;
DROP POLICY IF EXISTS "glide read users" ON public.users;

-- Note: Existing owner-only policies remain in place:
--   "Users can view their own data" (SELECT USING auth.uid() = user_id)
--   "Users can update their own data" (UPDATE USING auth.uid() = user_id)
-- This ensures authenticated users can only see/update their own row.
