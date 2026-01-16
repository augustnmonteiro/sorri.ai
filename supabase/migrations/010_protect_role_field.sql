-- Prevent users from updating their own role field
-- Only service_role (backend/dashboard) can change roles

CREATE OR REPLACE FUNCTION prevent_role_self_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is being changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Allow service_role (dashboard) - auth.uid() is NULL for service_role
    IF auth.uid() IS NULL THEN
      RETURN NEW;
    END IF;

    -- Prevent users from changing their own role
    IF auth.uid() = OLD.id THEN
      RAISE EXCEPTION 'Users cannot modify their own role';
    END IF;

    -- Only admins can change other users' roles
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Only admins can modify user roles';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS protect_role_update ON public.profiles;
CREATE TRIGGER protect_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_self_update();

-- Also prevent role from being set on insert (defaults to 'user')
CREATE OR REPLACE FUNCTION enforce_default_role_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Always set role to 'user' for new profiles
  -- Admin roles must be set later by an admin or service_role
  NEW.role := 'user';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_default_role ON public.profiles;
CREATE TRIGGER enforce_default_role
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION enforce_default_role_on_insert();
