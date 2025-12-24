'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
            <h2 className="mb-4 text-2xl font-bold">Algo deu errado nesta página!</h2>
            <button
                className="rounded bg-indigo-600 px-4 py-2 font-bold hover:bg-indigo-500"
                onClick={() => reset()}
            >
                Tentar novamente
            </button>
        </div>
    )
}
