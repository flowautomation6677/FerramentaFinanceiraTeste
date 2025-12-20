
'use client'

import { Bell, Search, Calendar, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DashboardHeader({ userEmail }: { userEmail: string | undefined }) {
    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-50 mb-8 flex items-center justify-between rounded-3xl border border-white/5 bg-slate-900/80 px-6 py-4 shadow-lg backdrop-blur-xl"
        >
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-indigo-500 bg-slate-800">
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}`}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-slate-900">
                        <div className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></div>
                    </div>
                </div>
                <div>
                    <h2 className="text-sm font-medium text-slate-400">Bem-vindo de volta,</h2>
                    <h1 className="text-lg font-bold text-white">Porquim Trader 🐷</h1>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button className="hidden items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 md:flex">
                    <Calendar size={16} className="text-indigo-400" />
                    <span>Este Mês</span>
                    <ChevronDown size={14} />
                </button>
                <button className="rounded-full border border-white/5 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white">
                    <Bell size={20} />
                </button>
            </div>
        </motion.header>
    )
}
