const axios = require('axios');

// Config from docker-compose.evolution.yml
const API_URL = 'http://localhost:8080';
const API_KEY = '429683C4C977415CAAFCCE10F7D57E11';

async function testConnection() {
    console.log(`🔌 Testing Connection to Evolution API...`);
    console.log(`URL: ${API_URL}`);
    console.log(`Key: ${API_KEY.substring(0, 4)}... (from docker-compose)`);

    try {
        // 1. Fetch Instances (Dashboard Logic)
        const url = `${API_URL}/instance/fetchInstances`;
        console.log(`\n1️⃣ Attempting GET ${url}...`);

        const response = await axios.get(url, {
            headers: { 'apikey': API_KEY }
        });

        console.log(`✅ SUCCESS! Status: ${response.status}`);
        console.log(`📦 Data Received:`, JSON.stringify(response.data, null, 2));

        if (Array.isArray(response.data) && response.data.length === 0) {
            console.warn(`\n⚠️  Connection works, but NO INSTANCES found. You need to create one.`);
        }

    } catch (error) {
        console.error(`\n❌ CONNECTION FAILED`);
        if (error.code === 'ECONNREFUSED') {
            console.error(`Reason: Server is DOWN or port 8080 is blocked.`);
            console.error(`Tip: Check if 'evolution_api' container is running via 'docker ps'.`);
        } else if (error.response) {
            console.error(`Status: ${error.response.status} ${error.response.statusText}`);
            console.error(`Message:`, error.response.data);
            if (error.response.status === 401 || error.response.status === 403) {
                console.error(`Reason: API Key rejected. Did you change it in the .env file?`);
            }
        } else {
            console.error(`Error:`, error.message);
        }
    }
}

testConnection();
