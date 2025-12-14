-- Fix RLS Policies for User Registration
-- Run this in Supabase SQL Editor to fix the registration issue
-- 
-- IMPORTANT: When using service_role key, Supabase should bypass RLS automatically.
-- If it's not working, this script fixes the policies to explicitly allow service role operations.

-- Drop existing policies on users table
DROP POLICY IF EXISTS "Service role can do anything" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Policy for service role - allows all operations
-- The service_role key should bypass RLS, but this ensures it works
CREATE POLICY "Service role can do anything" ON users
  FOR ALL 
  USING (
    -- Check JWT claims for service_role
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  )
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

-- Users can view their own profile (for authenticated users with anon key)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT 
  USING (auth.uid() = id);

-- Users can insert their own profile (if registration happens through frontend)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Update orders policies (same pattern)
DROP POLICY IF EXISTS "Service role can do anything" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

CREATE POLICY "Service role can do anything" ON orders
  FOR ALL 
  USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  )
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Update transactions policies (same pattern)
DROP POLICY IF EXISTS "Service role can do anything" ON transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;

CREATE POLICY "Service role can do anything" ON transactions
  FOR ALL 
  USING (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  )
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
  );

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT 
  USING (auth.uid() = user_id);
