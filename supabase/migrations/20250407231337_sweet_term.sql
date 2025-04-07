/*
  # Remove users table and related constraints

  1. Changes
    - Drop users table and all related constraints
    - Update questionnaires and audit_logs to use Supabase Auth user IDs
    
  2. Security
    - Maintain RLS policies for remaining tables
    - Update foreign key constraints to reference auth.users
*/

-- Drop existing foreign key constraints
ALTER TABLE IF EXISTS questionnaires
DROP CONSTRAINT IF EXISTS questionnaires_user_id_fkey;

ALTER TABLE IF EXISTS audit_logs
DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

-- Drop the users table
DROP TABLE IF EXISTS users;

-- Update questionnaires foreign key to reference auth.users
ALTER TABLE questionnaires
ADD CONSTRAINT questionnaires_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Update audit_logs foreign key to reference auth.users
ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE SET NULL;