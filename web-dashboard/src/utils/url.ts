export const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
        return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
    }

    // Fallback for vercel preview deployments if needed
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    return 'http://localhost:3000';
};
