
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import StatsGrid from '@/components/dashboard/StatsGrid'
import ExpenseChart from '@/components/dashboard/ExpenseChart'
import TransactionFeed from '@/components/dashboard/TransactionFeed'
import WhatsAppLinker from '@/components/dashboard/WhatsAppLinker'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: profile } = await supabase
        .from('perfis')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

    let transactions: any[] = []
    if (profile) {
        // Busca transações ordenadas pela data
        const output = await supabase
            .from('transacoes')
            .select('*')
            .order('data', { ascending: false })
        if (output.data) transactions = output.data
    }

    return (
        <div className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-slate-200">
            <div className="mx-auto max-w-7xl p-4 md:p-8">

                {/* Header Inteligente */}
                <DashboardHeader userEmail={user.email} />

                <main className="space-y-8">
                    {!profile ? (
                        // Estado: Sem Vínculo (Mostra apenas o linker)
                        <div className="mx-auto max-w-lg mt-20">
                            <WhatsAppLinker />
                        </div>
                    ) : (
                        <>
                            {/* Bento Grid Principal */}
                            <StatsGrid transactions={transactions} />

                            {/* Gráficos Neon */}
                            <ExpenseChart transactions={transactions} />

                            {/* Feed e Widget Lateral (GridLayout) */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="md:col-span-2">
                                    <TransactionFeed transactions={transactions} />
                                </div>

                                <div className="md:col-span-1 space-y-6">
                                    {/* Card de Conexão */}
                                    <div className="rounded-[2rem] bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-600/20">
                                        <h3 className="text-lg font-bold">Porquim IA</h3>
                                        <p className="mt-2 text-indigo-100 text-sm opacity-90">
                                            Seu assistente está conectado e monitorando seus gastos pelo número:
                                        </p>
                                        <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                                            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>
                                            <span className="font-mono text-sm tracking-wide">
                                                {profile.whatsapp_number.replace('@c.us', '')}
                                            </span>
                                        </div>
                                        <button className="mt-4 w-full rounded-xl bg-white py-3 text-sm font-bold text-indigo-600 transition hover:bg-indigo-50">
                                            Abrir no WhatsApp
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}
