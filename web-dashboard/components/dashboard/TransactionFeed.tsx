
'use client'

import { motion } from 'framer-motion'
import { Coffee, ShoppingBag, Car, Home, HeartPulse, MoreHorizontal } from 'lucide-react'

// Mapeamento de ícones por categoria simples
const getIcon = (categoria: string) => {
    const cat = categoria?.toLowerCase() || ''
    if (cat.includes('aliment')) return <Coffee size={20} />
    if (cat.includes('lazer')) return <ShoppingBag size={20} />
    if (cat.includes('transporte') || cat.includes('uber')) return <Car size={20} />
    if (cat.includes('casa') || cat.includes('contas')) return <Home size={20} />
    if (cat.includes('saúde') || cat.includes('saude')) return <HeartPulse size={20} />
    return <MoreHorizontal size={20} />
}

const getColor = (categoria: string) => {
    const cat = categoria?.toLowerCase() || ''
    if (cat.includes('aliment')) return 'bg-orange-500/20 text-orange-400'
    if (cat.includes('lazer')) return 'bg-pink-500/20 text-pink-400'
    if (cat.includes('transporte')) return 'bg-blue-500/20 text-blue-400'
    if (cat.includes('casa')) return 'bg-purple-500/20 text-purple-400'
    return 'bg-slate-700/50 text-slate-400'
}

export default function TransactionFeed({ transactions }: { transactions: any[] }) {
    return (
        <div className="col-span-1 rounded-[2rem] border border-white/5 bg-slate-900/50 p-6 shadow-xl backdrop-blur-md">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Últimas Transações</h3>
                <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300">Ver todas</button>
            </div>

            <div className="space-y-4">
                {transactions.slice(0, 5).map((t, i) => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group flex items-center justify-between rounded-xl bg-white/5 p-3 px-4 transition-all hover:bg-white/10 hover:shadow-lg hover:ring-1 hover:ring-indigo-500/30"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getColor(t.categoria)}`}>
                                {getIcon(t.categoria)}
                            </div>
                            <div>
                                <p className="font-medium text-slate-200">{t.descricao || 'Sem descrição'}</p>
                                <p className="text-xs text-slate-500">{new Date(t.data).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                        <span className="font-bold text-slate-200">
                            - {t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
