const axios = require('axios');

const API_URL = 'http://localhost:8080';
const API_KEY = '429683C4C977415CAAFCCE10F7D57E11';

async function resetInstance() {
    console.log(`🧹 Cleaning up instance 'FinanceBot_v2'...`);

    try {
        // 1. Delete
        const url = `${API_URL}/instance/delete/FinanceBot_v2`;
        await axios.delete(url, { headers: { 'apikey': API_KEY } });
        console.log(`✅ Instance Deleted.`);
    } catch (e) {
        console.log(`ℹ️ Delete skipped (maybe didn't exist?): ${e.message}`);
    }

    /*
    console.log(`\n✨ Creating FRESH instance 'FinanceBot_v3'...`);
    try {
        const createUrl = `${API_URL}/instance/create`;
        const res = await axios.post(createUrl, {
            instanceName: "FinanceBot_v3",
            token: "secret_token_123",
            qrcode: true,
            integration: "WHATSAPP-BAILEYS" 
        }, { headers: { 'apikey': API_KEY } });
        
        console.log(`✅ Instance Created!`);
        console.log(`📦 details:`, res.data);
    } catch (e) {
        console.error(`❌ Creation failed:`, e.message);
    }
    */
}

resetInstance();
