
'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { motion } from 'framer-motion'

const PIE_COLORS = ['#6366f1', '#34d399', '#f472b6', '#a78bfa', '#fbbf24', '#94a3b8']

export default function ExpenseChart({ transactions }: { transactions: any[] }) {
    if (!transactions || transactions.length === 0) return null

    // Dados para Gráfico de Área (Linha do tempo - últimos 7 dias)
    // Agrupa por data simples
    const groups = transactions.reduce((acc: any, t) => {
        const date = t.data.split('T')[0]
        acc[date] = (acc[date] || 0) + t.valor
        return acc
    }, {})

    const areaData = Object.keys(groups)
        .sort() // ordena datas
        .slice(-7) // pega ultimas 7
        .map(date => ({
            name: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            valor: groups[date]
        }))

    // Dados para Donut Chart (Categorias)
    const categoryData = transactions.reduce((acc: any, t) => {
        const found = acc.find((i: any) => i.name === t.categoria)
        if (found) {
            found.value += t.valor
        } else {
            acc.push({ name: t.categoria, value: t.valor })
        }
        return acc
    }, [])

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Gráfico de Área */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="col-span-1 md:col-span-2 rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 shadow-xl backdrop-blur-md"
            >
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-white">Evolução de Gastos</h3>
                    <p className="text-sm text-slate-500">Últimos 7 dias</p>
                </div>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={areaData}>
                            <defs>
                                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#475569"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                itemStyle={{ color: '#6366f1' }}
                                formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            />
                            <Area
                                type="monotone"
                                dataKey="valor"
                                stroke="#6366f1"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorValor)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Gráfico Donut */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 shadow-xl backdrop-blur-md"
            >
                <h3 className="mb-4 text-lg font-bold text-white">Categorias</h3>
                <div className="h-[200px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {categoryData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(0,0,0,0)" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                formatter={(value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Texto Central */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold text-white">{categoryData.length}</span>
                        <span className="text-xs text-slate-500">Categorias</span>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {categoryData.slice(0, 4).map((c: any, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                            {c.name}
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
