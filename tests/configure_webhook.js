const axios = require('axios');

const API_URL = 'http://localhost:8080';
const API_KEY = '429683C4C977415CAAFCCE10F7D57E11';
// Docker Desktop Windows: host.docker.internal points to the host machine
const WEBHOOK_URL = 'http://host.docker.internal:4001/webhook/evolution';

async function configureWebhook() {
    console.log(`🔗 Configuring Webhook...`);

    try {
        // 1. Fetch Instances to get the name
        const res = await axios.get(`${API_URL}/instance/fetchInstances`, {
            headers: { 'apikey': API_KEY }
        });

        const instances = res.data;
        if (instances.length === 0) {
            console.error("❌ No instances found. Create one in the dashboard first!");
            return;
        }

        // Assume the first one is the active one (e.g., FinanceBot_v3)
        const instanceName = instances[0].name;
        console.log(`🎯 Target Instance: ${instanceName}`);

        // 2. Set Webhook
        const webhookConfig = {
            webhook: {
                url: WEBHOOK_URL,
                webhookUrl: WEBHOOK_URL,
                enabled: true,
                webhookByEvents: true,
                events: [
                    "MESSAGES_UPSERT",
                    "MESSAGES_UPDATE",
                    "SEND_MESSAGE"
                ]
            }
        };

        const setRes = await axios.post(`${API_URL}/webhook/set/${instanceName}`, webhookConfig, {
            headers: { 'apikey': API_KEY }
        });

        console.log(`✅ Webhook Configured Successfully!`);
        console.log(`📍 URL: ${WEBHOOK_URL}`);
        console.log(`📦 Response:`, setRes.data);

    } catch (e) {
        console.error(`❌ Failed to configure webhook:`, e.message);
        if (e.response) {
            console.error(`Status: ${e.response.status}`);
            console.error(`Data:`, e.response.data);
        }
    }
}

configureWebhook();
