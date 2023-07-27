import { createClient } from '@supabase/supabase-js';

const privateKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!privateKey)
    throw new Error(`Expected env var NEXT_PUBLIC_SUPABASE_ANON_KEY`);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!url) throw new Error(`Expected env var NEXT_PUBLIC_SUPABASE_URL`);

const supabase = createClient(url, privateKey);

export default supabase;
