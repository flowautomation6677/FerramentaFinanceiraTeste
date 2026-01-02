const axios = require('axios');

const API_URL = 'http://localhost:8080';
const API_KEY = '429683C4C977415CAAFCCE10F7D57E11';
const INSTANCE_NAME = 'FinanceBot_v3';

async function forceReset() {
    console.log(`🧨 Force Resetting Instance '${INSTANCE_NAME}'...`);

    // 1. Try Logout
    try {
        await axios.delete(`${API_URL}/instance/logout/${INSTANCE_NAME}`, { headers: { 'apikey': API_KEY } });
        console.log("Logout OK.");
    } catch (e) {
        console.log("Logout Skipped (probably already closed).");
    }

    // 2. Delete
    try {
        await axios.delete(`${API_URL}/instance/delete/${INSTANCE_NAME}`, { headers: { 'apikey': API_KEY } });
        console.log("✅ Instance Deleted from DB.");
    } catch (e) {
        console.log("Delete Skipped (not found).");
    }

    console.log("⏳ Waiting 5s for cleanup...");
    await new Promise(r => setTimeout(r, 5000));

    // 3. Create Fresh
    try {
        console.log("🌱 Creating Fresh Instance...");
        const res = await axios.post(`${API_URL}/instance/create`, {
            instanceName: INSTANCE_NAME,
            token: "secret_token_123",
            qrcode: true,
            integration: "WHATSAPP-BAILEYS"
        }, { headers: { 'apikey': API_KEY } });
        console.log("✅ Instance Created:", res.data.instance.instanceName);

        // 4. Configure Webhook Immediately
        const webhookConfig = {
            webhook: {
                enabled: true,
                url: 'http://host.docker.internal:4001/webhook/evolution',
                webhookUrl: 'http://host.docker.internal:4001/webhook/evolution',
                webhookByEvents: true,
                events: ["MESSAGES_UPSERT", "MESSAGES_UPDATE", "SEND_MESSAGE"]
            }
        };
        await axios.post(`${API_URL}/webhook/set/${INSTANCE_NAME}`, webhookConfig, { headers: { 'apikey': API_KEY } });
        console.log("✅ Webhook Configured.");

    } catch (e) {
        console.error("❌ Reset Failed:", e.message);
        if (e.response) console.error(e.response.data);
    }
}

forceReset();
