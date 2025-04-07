/*
  # Fix Audit Logs RLS Policies

  1. Changes
    - Drop existing audit logs policies
    - Add new policies that allow service role to insert records
    - Maintain user read access to their own records
    
  2. Security
    - Enable RLS (already enabled)
    - Service role can insert records
    - Users can only read their own records
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- Create new policies
CREATE POLICY "service_role_insert_audit_logs"
ON audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "users_read_own_audit_logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);