-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


-- Create a function that allows a user to delete their own account
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current user's ID
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete the user from auth.users
  -- This will cascade delete due to foreign key constraints
  DELETE FROM auth.users WHERE id = current_user_id;
  
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION public.delete_user() IS 
'Allows an authenticated user to delete their own account. This is a SECURITY DEFINER function that runs with elevated privileges to delete from auth.users table.';
