import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('perfis')
        .select('is_admin')
        .eq('auth_user_id', user.id)
        .single();

    if (!profile?.is_admin) {
        // Security: Block access and send to user dashboard
        redirect('/dashboard');
    }

    return (
        <>
            {children}
        </>
    );
}
