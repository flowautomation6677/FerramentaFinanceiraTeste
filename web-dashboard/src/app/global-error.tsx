'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
                    <h2 className="mb-4 text-2xl font-bold">Algo deu errado!</h2>
                    <p className="mb-6 text-slate-400">{error.message}</p>
                    <button
                        className="rounded bg-indigo-600 px-4 py-2 font-bold hover:bg-indigo-500"
                        onClick={() => reset()}
                    >
                        Tentar novamente
                    </button>
                </div>
            </body>
        </html>
    )
}
