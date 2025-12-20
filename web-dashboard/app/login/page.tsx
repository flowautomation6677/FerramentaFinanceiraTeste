
'use client'

import { useState } from 'react'
import { login, signup } from './actions'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setMessage(null)

        const formData = new FormData(event.currentTarget)

        try {
            if (isLogin) {
                const res = await login(formData)
                if (res?.error) {
                    setMessage({ text: 'Erro no login: ' + res.error, type: 'error' })
                }
                // Se der certo, o redirect acontece no server
            } else {
                const res = await signup(formData)
                if (res?.error) {
                    setMessage({ text: 'Erro no cadastro: ' + res.error, type: 'error' })
                } else if (res?.success) {
                    setMessage({ text: res.success, type: 'success' })
                    setIsLogin(true) // Volta pra login pra pessoa tentar entrar depois de confirmar (ou se o supabase for auto-confirm)
                }
            }
        } catch (e) {
            setMessage({ text: 'Erro inesperado. Tente novamente.', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="bg-blue-600 p-8 text-center text-white">
                    <h1 className="text-3xl font-bold">Finance Bot</h1>
                    <p className="mt-2 text-blue-100">Controle seus gastos pelo WhatsApp</p>
                </div>

                <div className="p-8">
                    <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
                        <button
                            onClick={() => { setIsLogin(true); setMessage(null) }}
                            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setMessage(null) }}
                            className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Cadastrar
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {message && (
                            <div className={`rounded-lg p-3 text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-700">E-mail</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="seu@email.com"
                                className="rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-700">Senha</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                placeholder="******"
                                className="rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 flex items-center justify-center rounded-lg bg-blue-600 py-2.5 font-bold text-white hover:bg-blue-700 disabled:opacity-70"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLogin ? 'Acessar Painel' : 'Criar Conta'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
