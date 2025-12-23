'use client';

import { useState } from 'react';
import { Title, Text, Card, TextInput, Button, Metric, ProgressBar } from "@tremor/react";
import { createBrowserClient } from "@supabase/ssr";
import { Smartphone, Target, PiggyBank, ArrowRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data
    const [whatsapp, setWhatsapp] = useState('');
    const [income, setIncome] = useState('');
    const [goal, setGoal] = useState('');

    // Step 1: Format & Validate Phone
    const handlePhoneChange = (e: any) => {
        let value = e.target.value.replace(/\D/g, ""); // Only numbers
        if (value.length > 11) value = value.slice(0, 11);

        // Mask (00) 00000-0000
        if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        if (value.length > 9) value = `${value.slice(0, 10)}-${value.slice(10)}`;

        setWhatsapp(value);
    };

    const savePhone = async () => {
        setLoading(true);
        const cleanPhone = whatsapp.replace(/\D/g, ""); // 55 + DDD + NUM
        // Assuming Brazil default 55
        const fullNumber = `55${cleanPhone}`;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return; // Should handle auth error

        const { error } = await supabase
            .from('perfis')
            .update({ whatsapp_number: fullNumber })
            .eq('auth_user_id', user.id);

        setLoading(false);
        if (!error) setStep(2);
    };

    // Step 2: Save Goals
    const saveGoals = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('perfis')
            .update({
                monthly_income: parseFloat(income),
                savings_goal: parseFloat(goal),
                onboarding_completed: true
            })
            .eq('auth_user_id', user!.id);

        setLoading(false);
        if (!error) setStep(3);
    };

    // Calculations for feedback
    const dailyBudget = income && goal ? (parseFloat(income) - parseFloat(goal)) / 30 : 0;

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <Card className="max-w-md w-full glass-card ring-0 p-8 shadow-2xl relative overflow-hidden">
                {/* Progress Bar Top */}
                <div className="absolute top-0 left-0 w-full">
                    <ProgressBar value={(step / 3) * 100} color="indigo" className="h-1" />
                </div>

                <div className="mb-8 text-center">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                        <span className="text-2xl">🐷</span>
                    </div>
                    <Title className="text-white text-2xl">Configuração Inicial</Title>
                    <Text className="text-slate-400">Vamos personalizar seu assistente.</Text>
                </div>

                {/* STEP 1: WHATSAPP */}
                {step === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-1 block">Seu WhatsApp</label>
                            <TextInput
                                icon={Smartphone}
                                placeholder="(11) 99999-9999"
                                value={whatsapp}
                                onChange={handlePhoneChange}
                                className="text-lg"
                            />
                            <Text className="text-xs text-slate-500 mt-2">Usaremos este número para falar com você.</Text>
                        </div>
                        <Button
                            size="xl"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 border-none group"
                            onClick={savePhone}
                            loading={loading}
                            disabled={whatsapp.length < 14} // Length of formatted string
                        >
                            Continuar <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                )}

                {/* STEP 2: FINANCES */}
                {step === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-1 block">Renda Mensal Estimada</label>
                            <TextInput
                                icon={Target}
                                placeholder="R$ 5000.00"
                                type="number"
                                value={income}
                                onValueChange={setIncome}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-1 block">Meta de Economia</label>
                            <TextInput
                                icon={PiggyBank}
                                placeholder="R$ 1000.00"
                                type="number"
                                value={goal}
                                onValueChange={setGoal}
                            />
                        </div>

                        {/* Instant Feedback */}
                        {Number(income) > Number(goal) && (
                            <div className="bg-emerald-900/20 border border-emerald-500/20 p-4 rounded-lg">
                                <Text className="text-emerald-400 text-sm">Boa escolha! Sobrará para gastar:</Text>
                                <Metric className="text-emerald-300 mt-1">
                                    R$ {(parseFloat(income) - parseFloat(goal)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </Metric>
                                <Text className="text-emerald-500/60 text-xs mt-1">
                                    ~ R$ {dailyBudget.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} por dia.
                                </Text>
                            </div>
                        )}

                        <Button
                            size="xl"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 border-none"
                            onClick={saveGoals}
                            loading={loading}
                            disabled={!income || !goal}
                        >
                            Finalizar Setup
                        </Button>
                    </div>
                )}

                {/* STEP 3: HANDSHAKE */}
                {step === 3 && (
                    <div className="text-center space-y-6 animate-fadeIn">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                            <Check size={32} />
                        </div>
                        <div>
                            <Title className="text-white">Tudo Pronto!</Title>
                            <Text className="text-slate-400 mt-2">Seu assistente já sabe suas metas.</Text>
                        </div>

                        <a
                            href={`https://wa.me/${whatsapp.replace(/\D/g, "") ? "55" + whatsapp.replace(/\D/g, "") : ""}?text=Olá! Quero começar a economizar com a Porquim IA.`}
                            target="_blank"
                            className="block"
                        >
                            <Button size="xl" color="emerald" className="w-full" icon={Smartphone}>
                                Chamar no WhatsApp
                            </Button>
                        </a>

                        <Button
                            variant="secondary"
                            className="w-full mt-2"
                            onClick={() => router.push('/dashboard')}
                        >
                            Ir para Dashboard
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
