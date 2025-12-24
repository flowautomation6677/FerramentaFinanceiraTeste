import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white space-y-4">
            <h2 className="text-3xl font-bold">Página não encontrada</h2>
            <p className="text-slate-400">Não conseguimos encontrar o que você procurava.</p>
            <Link href="/dashboard" className="rounded bg-indigo-600 px-4 py-2 font-bold hover:bg-indigo-500 transition">
                Voltar ao Dashboard
            </Link>
        </div>
    )
}
