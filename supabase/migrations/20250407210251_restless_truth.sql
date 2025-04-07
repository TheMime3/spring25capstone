/*
  # Add Audit Log Stored Procedure

  1. New Features
    - Add stored procedure for logging audit events
    - Procedure runs with security definer to bypass RLS
    
  2. Security
    - Procedure validates input parameters
    - Only authenticated users can call the procedure
    - Procedure runs with elevated privileges
*/

-- Create stored procedure for logging audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate parameters
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id cannot be null';
  END IF;
  
  IF p_event_type IS NULL THEN
    RAISE EXCEPTION 'event_type cannot be null';
  END IF;

  -- Insert audit log
  INSERT INTO audit_logs (
    user_id,
    event_type,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    p_user_id,
    p_event_type,
    p_ip_address,
    p_user_agent,
    NOW()
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION log_audit_event TO authenticated;