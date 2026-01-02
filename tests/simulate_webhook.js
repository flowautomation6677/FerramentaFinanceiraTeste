const axios = require('axios');

const TARGET_URL = 'http://localhost:4001/webhook/evolution';

const PAYLOAD = {
    "event": "MESSAGES_UPSERT",
    "instance": "FinanceBot_v3",
    "data": {
        "key": {
            "remoteJid": "5511999999999@s.whatsapp.net",
            "fromMe": false,
            "id": "TestMessageID123"
        },
        "pushName": "Tester",
        "message": {
            "conversation": "Olá mundo teste"
        },
        "messageType": "conversation",
        "messageTimestamp": 1704211200
    },
    "destination": "http://host.docker.internal:4001/webhook/evolution",
    "dateTime": "2024-01-02T12:00:00.000Z",
    "sender": "5511999999999@s.whatsapp.net",
    "serverUrl": "http://localhost:8080",
    "apikey": "429683C4C977415CAAFCCE10F7D57E11"
};

async function simulateWebhook() {
    console.log(`🚀 Simulating Webhook Event to ${TARGET_URL}...`);
    try {
        const res = await axios.post(TARGET_URL, PAYLOAD);
        console.log(`✅ Success! Status: ${res.status}`);
        console.log(`Response:`, res.data);
    } catch (e) {
        console.error(`❌ Failed:`, e.message);
        if (e.code === 'ECONNREFUSED') {
            console.error(`Reason: Nothing listening on port 4001. Is 'npm run dev' running?`);
        }
    }
}

simulateWebhook();
