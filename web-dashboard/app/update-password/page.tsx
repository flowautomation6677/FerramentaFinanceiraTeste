'use client';

import { useState, useEffect } from 'react';
import { Title, Text, Card, TextInput, Button } from "@tremor/react";
import { createBrowserClient } from "@supabase/ssr";
import { Lock, User, Phone, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form Data
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            // If no user, maybe the link expired or something. Redirect to login?
            // For now, let's just redirect to login
            router.replace('/login');
            return;
        }

        setEmail(user.email || "");

        // Fetch existing profile data to pre-fill
        const { data: profile } = await supabase
            .from('perfis')
            .select('*')
            .eq('auth_user_id', user.id)
            .single();

        if (profile) {
            setName(profile.name || "");
            setWhatsapp(profile.whatsapp_number || "");
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (password !== confirmPassword) return alert("As senhas não coincidem.");
        if (password.length < 6) return alert("A senha deve ter pelo menos 6 caracteres.");

        setSaving(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        try {
            // 1. Update Password
            const { error: authError } = await supabase.auth.updateUser({ password: password });
            if (authError) throw authError;

            // 2. Update Profile Data
            const { error: profileError } = await supabase
                .from('perfis')
                .update({
                    name,
                    whatsapp_number: whatsapp,
                    // Mark as active/onboarded if you have a flag for that
                })
                .eq('auth_user_id', user.id);

            if (profileError) throw profileError;

            // Success! Redirect to Dashboard
            router.push('/dashboard');
        } catch (error: any) {
            alert("Erro ao salvar: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <Card className="max-w-md w-full glass-card ring-0 p-8 shadow-2xl relative overflow-hidden border-t-4 border-t-indigo-500">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-indigo-500/20">
                        <User className="w-8 h-8 text-indigo-400" />
                    </div>
                    <Title className="text-white text-2xl">Bem-vindo(a)!</Title>
                    <Text className="text-slate-400">Vamos finalizar seu cadastro para acessar o painel.</Text>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 font-medium ml-1">Seu E-mail (Confirmado)</label>
                        <TextInput value={email} disabled className="mt-1 opacity-60" />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 font-medium ml-1">Nome Completo</label>
                        <TextInput
                            value={name}
                            onValueChange={setName}
                            placeholder="Como quer ser chamado?"
                            icon={User}
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 font-medium ml-1">WhatsApp</label>
                        <TextInput
                            value={whatsapp}
                            onValueChange={setWhatsapp}
                            placeholder="(xx) xxxxx-xxxx"
                            icon={Phone}
                            className="mt-1"
                        />
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <label className="text-xs text-slate-400 font-medium ml-1">Defina sua Senha</label>
                        <TextInput
                            type="password"
                            value={password}
                            onValueChange={setPassword}
                            placeholder="Mínimo 6 caracteres"
                            icon={Lock}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-medium ml-1">Confirme a Senha</label>
                        <TextInput
                            type="password"
                            value={confirmPassword}
                            onValueChange={setConfirmPassword}
                            placeholder="Repita a senha"
                            icon={Lock}
                            className="mt-1"
                        />
                    </div>

                    <Button
                        size="xl"
                        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
                        loading={saving}
                        onClick={handleSave}
                        icon={ArrowRight}
                        iconPosition="right"
                        disabled={!password || !confirmPassword || password !== confirmPassword}
                    >
                        Ativar Conta e Entrar
                    </Button>
                </div>
            </Card>
        </div>
    );
}
