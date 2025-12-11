import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is required in environment variables');
}

// Service Role Key yoksa Anon Key kullan (development için)
const keyToUse = supabaseServiceKey || supabaseAnonKey;

if (!keyToUse) {
  throw new Error('Either SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is required in environment variables');
}

if (!supabaseServiceKey) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not found. Using ANON_KEY. Some admin operations may not work.');
}

// Admin client (service role key ile - tüm yetkilere sahip)
export const supabaseAdmin = createClient(supabaseUrl, keyToUse, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Public client (anon key ile - frontend için)
export const supabaseUrlPublic = supabaseUrl;
export { supabaseAnonKey };

export default supabaseAdmin;

