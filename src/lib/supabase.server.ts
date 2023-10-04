import { createClient } from '@supabase/supabase-js';

const privateKey = process.env.SUPABASE_PRIVATE_KEY;
if (!privateKey) throw new Error(`Expected env var SUPABASE_PRIVATE_KEY`);

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!url) throw new Error(`Expected env var NEXT_PUBLIC_SUPABASE_URL`);

const supabase = createClient<Database>(url, privateKey, {
    auth: {
        persistSession: false,
    },
});

export default supabase;
