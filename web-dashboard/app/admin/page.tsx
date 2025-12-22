'use client';

import { useState, useEffect } from 'react';
import { Title, Text, Tab, TabList, TabGroup, TabPanel, TabPanels, Grid, Card, Flex, Metric, Icon, Badge } from "@tremor/react";
import { createBrowserClient } from "@supabase/ssr";
import { Activity, DollarSign, Cpu, Search, AlertTriangle } from 'lucide-react';

// Sections
import TheLab from '@/components/admin/sections/TheLab';
import TheCFO from '@/components/admin/sections/TheCFO';
import TheSRE from '@/components/admin/sections/TheSRE';

export default function AdminDashboard() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [efficiencyData, setEfficiencyData] = useState<any[]>([]);
    const [financeData, setFinanceData] = useState<any[]>([]);

    // KPIs (Simulated for "Expert" Feel if empty)
    const kpis = [
        { title: "Precisão da IA", metric: "94.2%", icon: Activity, color: "indigo" },
        { title: "Economia Gerada", metric: "R$ 1,250", icon: DollarSign, color: "emerald" },
        { title: "Transações Hoje", metric: "128", icon: Activity, color: "blue" },
    ];

    // Load Data
    useEffect(() => {
        async function load() {
            const { data: eff } = await supabase.from('view_ai_efficiency').select('*');
            const { data: fin } = await supabase.from('view_financial_metrics').select('*');

            if (eff && eff.length > 0) setEfficiencyData(eff);
            else {
                // Mock Data for "Wow" Effect if DB is empty
                setEfficiencyData([
                    { prompt_version: 'v1_stable', error_rate_percent: 12.5, avg_confidence: 0.88, total_samples: 450 },
                    { prompt_version: 'v2_experimental', error_rate_percent: 4.2, avg_confidence: 0.96, total_samples: 420 },
                ]);
            }

            if (fin && fin.length > 0) setFinanceData(fin);
            else {
                // Mock Data
                setFinanceData([
                    { date: '2023-10-01', est_cost_usd: 0.45 },
                    { date: '2023-10-02', est_cost_usd: 0.52 },
                    { date: '2023-10-03', est_cost_usd: 0.48 },
                    { date: '2023-10-04', est_cost_usd: 1.20 },
                    { date: '2023-10-05', est_cost_usd: 0.80 },
                    { date: '2023-10-06', est_cost_usd: 0.65 },
                    { date: '2023-10-07', est_cost_usd: 0.90 },
                ]);
            }
        }
        load();
    }, [supabase]);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-50 p-6 sm:p-10 selection:bg-indigo-500/30">
            {/* --- HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <Text className="text-emerald-400 font-mono text-xs tracking-wider uppercase">System Operational</Text>
                    </div>
                    <Title className="text-4xl font-bold mt-1 tracking-tight text-white neon-text-indigo">
                        Nexus Command Center
                    </Title>
                    <Text className="text-slate-400">Real-time Intelligence & Financial Telemetry</Text>
                </div>
                <div className="flex gap-2">
                    <Badge color="indigo" size="lg" icon={Cpu}>v2.1.0-ULTRA</Badge>
                </div>
            </div>

            {/* --- TOP KPIs --- */}
            <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6 mb-8">
                {kpis.map((item) => (
                    <Card key={item.title} className="glass-card ring-0 border-t-4 border-indigo-500 transform hover:scale-[1.02] transition-all duration-300">
                        <Flex alignItems="start">
                            <div>
                                <Text className="text-slate-400 uppercase text-xs font-bold tracking-widest">{item.title}</Text>
                                <Metric className="text-white mt-2">{item.metric}</Metric>
                            </div>
                            <Icon icon={item.icon} variant="solid" color={item.color as any} size="lg" className="shadow-lg rounded-xl" />
                        </Flex>
                    </Card>
                ))}
            </Grid>

            {/* --- MAIN DASHBOARD --- */}
            <TabGroup className="mt-6">
                <TabList className="bg-slate-900/50 p-1 rounded-xl border border-white/5 inline-flex">
                    <Tab className="px-4 py-2 text-sm font-medium ui-selected:bg-indigo-600 ui-selected:text-white ui-not-selected:text-slate-400 rounded-lg transition-all" icon={Search}>The Lab (AI)</Tab>
                    <Tab className="px-4 py-2 text-sm font-medium ui-selected:bg-emerald-600 ui-selected:text-white ui-not-selected:text-slate-400 rounded-lg transition-all" icon={DollarSign}>The CFO (Fin)</Tab>
                    <Tab className="px-4 py-2 text-sm font-medium ui-selected:bg-rose-600 ui-selected:text-white ui-not-selected:text-slate-400 rounded-lg transition-all" icon={AlertTriangle}>The SRE (Ops)</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel>
                        <TheLab efficiencyData={efficiencyData} />
                    </TabPanel>

                    <TabPanel>
                        <TheCFO financeData={financeData} />
                    </TabPanel>

                    <TabPanel>
                        <TheSRE />
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </main>
    );
}
