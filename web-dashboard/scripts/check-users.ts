
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role to bypass RLS

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
    console.log("Checking registered users in 'perfis' table...");

    // 1. Get Perfis (Public profiles)
    const { data: perfis, error } = await supabase
        .from('perfis')
        .select('id, email, nome, telefone');

    if (error) {
        console.error("Error fetching perfis:", error);
    } else {
        console.log("\n--- Public Profiles (Perfis) ---");
        console.table(perfis);
    }

    // 2. Get Auth Users (Admin only)
    // This helps confirm if they are in Auth but maybe missing from Perfis
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error("Error fetching auth users:", authError);
    } else {
        console.log("\n--- Auth Users (Supabase Auth) ---");
        console.table(users.map(u => ({ id: u.id, email: u.email, confirmed_at: u.confirmed_at })));
    }
}

checkUsers();
