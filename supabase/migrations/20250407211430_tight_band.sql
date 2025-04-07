/*
  # Add Questionnaire Handling Stored Procedure

  1. New Features
    - Add stored procedure for handling questionnaire submissions
    - Procedure handles both insert and update operations
    
  2. Security
    - Procedure validates input parameters
    - Only authenticated users can call the procedure
    - Procedure runs with elevated privileges
*/

CREATE OR REPLACE FUNCTION handle_questionnaire(
  p_user_id UUID,
  p_responses JSONB
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
  
  IF p_responses IS NULL THEN
    RAISE EXCEPTION 'responses cannot be null';
  END IF;

  -- Insert or update questionnaire
  INSERT INTO questionnaires (
    user_id,
    responses
  ) VALUES (
    p_user_id,
    p_responses
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    responses = EXCLUDED.responses,
    updated_at = NOW();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION handle_questionnaire TO authenticated;

-- Add unique constraint on user_id if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'questionnaires_user_id_key'
  ) THEN
    ALTER TABLE questionnaires ADD CONSTRAINT questionnaires_user_id_key UNIQUE (user_id);
  END IF;
END $$;