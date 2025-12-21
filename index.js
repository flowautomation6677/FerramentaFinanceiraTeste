const client = require('./src/services/whatsappClient');
const { handleMessage } = require('./src/handlers/messageHandler');
const logger = require('./src/services/loggerService');
require('./src/workers/mediaWorker'); // Initialize Worker


logger.info("🚀 Iniciando Porquim 360 (V2 - Modular)...");

// Registra o handler principal
client.on('message', async (msg) => {
    // Optional: Log incoming message event (debug level)
    // logger.debug("Message received", { from: msg.from, type: msg.type });
    await handleMessage(msg);
});

client.on('ready', () => {
    logger.info('✅ Cliente WhatsApp conectado e pronto!');
    logger.info('✅ VERSÃO ATUALIZADA (RC-FINAL) CARREGADA COM SUCESSO!');
});

client.on('auth_failure', msg => {
    logger.error('❌ Falha na autenticação', { error: msg });
});

client.on('disconnected', (reason) => {
    logger.warn('❌ Cliente desconectado', { reason: reason });
});

// Inicializa
client.initialize();
