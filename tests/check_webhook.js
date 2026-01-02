const axios = require('axios');

const API_URL = 'http://localhost:8080';
const API_KEY = '429683C4C977415CAAFCCE10F7D57E11';
const INSTANCE_NAME = 'FinanceBot_v3';

async function checkWebhook() {
    console.log(`🔍 Checking Webhook Config for '${INSTANCE_NAME}'...`);

    try {
        const url = `${API_URL}/webhook/find/${INSTANCE_NAME}`;
        const res = await axios.get(url, {
            headers: { 'apikey': API_KEY }
        });

        console.log(`📦 Current Config:`, JSON.stringify(res.data, null, 2));

    } catch (e) {
        console.error(`❌ Check failed:`, e.message);
        if (e.response) console.error(e.response.data);
    }
}

checkWebhook();
