/**
 * Dev-only smoke insert for stories table.
 * Usage:
 *   SUPABASE_SERVICE_ROLE=... TEST_USER_ID=... npm run smoke:insert
 * Falls back to anon key (likely to fail RLS) if no service role provided.
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if(!url || !anon){
  console.error('[smoke-insert] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env.');
  process.exit(1);
}
const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

const key = serviceRole || anon;
if(!serviceRole){
  console.warn('[smoke-insert] SUPABASE_SERVICE_ROLE not set; RLS may block insert.');
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const userId = process.env.TEST_USER_ID || '00000000-0000-0000-0000-000000000000';

async function run(){
  const payload = {
    user_id: userId,
    designer_key: 'marisol',
    brand: 'sherwin_williams',
    inputs: {},
    palette: {},
    narrative: null,
    has_variants: false,
    status: 'new'
  };
  console.log('[smoke-insert] inserting payload keys', Object.keys(payload));
  const { data, error } = await supabase.from('stories').insert(payload).select().single();
  if(error){
    console.error('[smoke-insert] insert failed', { code: (error as any).code, message: error.message, details: (error as any).details, hint: (error as any).hint });
  } else {
    console.log('[smoke-insert] success', data);
  }
}

run();
