/*
  # Fix questionnaire RLS policies

  1. Changes
    - Drop existing questionnaire policies
    - Add new permissive policies for questionnaires
    - Add stored procedure for questionnaire operations

  2. Security
    - Maintain RLS enabled
    - Add more granular policies for questionnaire access
*/

-- Drop existing questionnaire policies
DROP POLICY IF EXISTS "Users can read own questionnaires" ON questionnaires;
DROP POLICY IF EXISTS "Users can insert own questionnaires" ON questionnaires;
DROP POLICY IF EXISTS "Users can update own questionnaires" ON questionnaires;

-- Create new policies for questionnaires
CREATE POLICY "users_read_own_questionnaires"
ON questionnaires
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_questionnaires"
ON questionnaires
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_questionnaires"
ON questionnaires
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create stored procedure for questionnaire operations
CREATE OR REPLACE FUNCTION handle_questionnaire(
  p_user_id UUID,
  p_responses JSONB
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  responses JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_questionnaire_id UUID;
BEGIN
  -- Check if questionnaire exists
  SELECT id INTO v_questionnaire_id
  FROM questionnaires
  WHERE user_id = p_user_id;

  IF v_questionnaire_id IS NULL THEN
    -- Insert new questionnaire
    INSERT INTO questionnaires (user_id, responses)
    VALUES (p_user_id, p_responses)
    RETURNING questionnaires.* INTO handle_questionnaire;
  ELSE
    -- Update existing questionnaire
    UPDATE questionnaires
    SET responses = p_responses,
        updated_at = NOW()
    WHERE id = v_questionnaire_id
    RETURNING questionnaires.* INTO handle_questionnaire;
  END IF;

  RETURN;
END;
$$;