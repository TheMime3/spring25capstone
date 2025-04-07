/*
  # Fix RLS policies for questionnaires table

  1. Changes
    - Drop existing RLS policies for questionnaires table
    - Create new policies with correct conditions for INSERT/UPDATE operations
    
  2. Security
    - Enable RLS (already enabled)
    - Add policies for:
      - INSERT: Users can only insert questionnaires with their own user_id
      - SELECT: Users can only read their own questionnaires
      - UPDATE: Users can only update their own questionnaires
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own questionnaires" ON questionnaires;
DROP POLICY IF EXISTS "Users can read own questionnaires" ON questionnaires;
DROP POLICY IF EXISTS "Users can update own questionnaires" ON questionnaires;

-- Create new policies with correct conditions
CREATE POLICY "Users can insert own questionnaires" 
ON questionnaires 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own questionnaires" 
ON questionnaires 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own questionnaires" 
ON questionnaires 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);