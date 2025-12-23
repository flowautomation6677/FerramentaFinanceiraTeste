
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase Admin (Service Role)
// We need this to bypass RLS and use adminAuth functions
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // Invite User via Supabase Auth
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)

        if (error) {
            console.error('Error inviting user:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Optional: Create a profile entry immediately if you want, 
        // but usually the user creation trigger handles this or we wait for them to login.
        // For now, let's just return success.

        return NextResponse.json({ success: true, user: data.user })

    } catch (err: any) {
        console.error('Invite API Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
