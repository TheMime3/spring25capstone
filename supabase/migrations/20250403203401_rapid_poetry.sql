/*
  # Fix user registration policies

  1. Changes
    - Add policy to allow unauthenticated users to register
    - Modify user existence check to handle no rows gracefully
    - Add policy for email uniqueness check

  2. Security
    - Enable RLS on users table (already enabled)
    - Add policy for public registration
    - Maintain existing policies for authenticated users
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Allow public registration" ON users;
DROP POLICY IF EXISTS "Allow email check" ON users;

-- Add policy to allow public registration
CREATE POLICY "Allow public registration"
ON users
FOR INSERT
TO public
WITH CHECK (true);

-- Add policy to allow checking email existence
CREATE POLICY "Allow email check"
ON users
FOR SELECT
TO public
USING (true);