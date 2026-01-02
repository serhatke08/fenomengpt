import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// .env dosyasını backend klasöründen yükle
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is required in environment variables');
}

// Service Role Key zorunlu - RLS bypass için
if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations (RLS bypass)');
}

if (!supabaseAnonKey) {
  throw new Error('SUPABASE_ANON_KEY is required');
}

// Admin client (service role key ile - RLS bypass eder)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Auth client (anon key ile - login için)
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Public client (anon key ile - frontend için)
export const supabaseUrlPublic = supabaseUrl;
export { supabaseAnonKey };

export default supabaseAdmin;

