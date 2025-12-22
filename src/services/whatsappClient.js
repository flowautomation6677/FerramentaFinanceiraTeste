const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const fs = require('fs');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ],
        headless: false
    }
});

client.on('qr', (qr) => {
    // Generate terminal QR
    qrcode.generate(qr, { small: true });

    // Save to file for User UI
    QRCode.toFile('qrcode.png', qr, {
        color: {
            dark: '#000000',  // Black dots
            light: '#FFFFFF' // White background
        }
    }, function (err) {
        if (err) console.error("Error saving QR:", err);
        else console.log('✅ QR Code saved to qrcode.png');
    });

    console.log('QR Code gerado! Escaneie com seu WhatsApp.');
});

client.on('ready', () => {
    console.log('✅ Cliente WhatsApp conectado e pronto!');
    console.log("✅ VERSÃO ATUALIZADA (RC-FINAL) CARREGADA COM SUCESSO!");
});

module.exports = client;
