const axios = require('axios');

const API_URL = 'http://localhost:8080';
const API_KEY = '429683C4C977415CAAFCCE10F7D57E11';
const INSTANCE_NAME = 'FinanceBot_v3';

async function createInstance() {
    console.log(`🔨 Creating Instance '${INSTANCE_NAME}'...`);

    try {
        const createUrl = `${API_URL}/instance/create`;
        const res = await axios.post(createUrl, {
            instanceName: INSTANCE_NAME,
            token: "secret_token_123",
            qrcode: true,
            integration: "WHATSAPP-BAILEYS"
        }, { headers: { 'apikey': API_KEY } });

        console.log(`✅ Instance Created Successfully!`);
        console.log(`📦 ID:`, res.data.instance?.instanceId);
        console.log(`🔑 Token:`, res.data.hash?.apikey);

    } catch (e) {
        if (e.response && e.response.status === 403) {
            console.log(`ℹ️ Instance might already exist (403 Forbidden). Assuming success.`);
        } else {
            console.error(`❌ Creation failed:`, e.message);
            if (e.response) console.error(e.response.data);
        }
    }
}

createInstance();
