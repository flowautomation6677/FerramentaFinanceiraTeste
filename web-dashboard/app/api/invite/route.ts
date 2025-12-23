
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase Admin (Service Role)
// We need this to bypass RLS and use adminAuth functions
// Initialize Supabase Admin (Service Role)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);


export async function POST(request: Request) {
    try {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error("❌ Erro: SUPABASE_SERVICE_ROLE_KEY não encontrada no servidor (Local ou Railway).");
            return NextResponse.json({ error: 'Configuração de API incompleta (Service Key Missing).' }, { status: 500 });
        }

        const { email, name, whatsapp } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // Invite User via Supabase Auth
        // Use 'redirectTo' to point to your setup page if needed
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);

        if (error) {
            console.error('Error inviting user:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Profile Pre-provisioning
        // Insert/Update profile with Name and Phone immediately
        if (data.user) {
            const updates: any = {
                updated_at: new Date().toISOString()
            };
            if (name) updates.name = name;
            if (whatsapp) updates.whatsapp_number = whatsapp;

            // We upsert because the trigger handle_new_user might have run already or not
            // Actually handle_new_user runs on INSERT into auth.users, so row should exist.
            // We use update.
            const { error: profileError } = await supabaseAdmin
                .from('perfis')
                .update(updates)
                .eq('id', data.user.id);

            if (profileError) {
                console.warn("⚠️ User invited but profile update failed:", profileError);
            }
        }

        return NextResponse.json({ success: true, user: data.user })

    } catch (err: any) {
        console.error('Invite API Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
