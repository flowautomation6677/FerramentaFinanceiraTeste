const axios = require('axios');
const logger = require('./loggerService');

class EvolutionService {
    constructor() {
        this.baseUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
        this.apiKey = process.env.EVOLUTION_API_KEY;
        this.instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'FinanceBot';

        if (!this.apiKey) {
            logger.error('❌ EVOLUTION_API_KEY is missing in .env');
        }

        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'apikey': this.apiKey,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Send a text message
     * @param {string} to - Remote JID (e.g., 5511999999999@s.whatsapp.net)
     * @param {string} text - Message content
     */
    async sendText(to, text) {
        try {
            const url = `/message/sendText/${this.instanceName}`;
            const body = {
                number: to,
                options: {
                    delay: 1200,
                    presence: 'composing',
                    linkPreview: false
                },
                textMessage: {
                    text: text
                }
            };

            const response = await this.client.post(url, body);
            return response.data;
        } catch (error) {
            logger.error('❌ Error sending text via Evolution API', { error: error.message, data: error.response?.data });
            throw error;
        }
    }

    /**
     * Send media (Image, Audio, Document)
     * @param {string} to - Remote JID
     * @param {object} media - { mimetype, data (base64), filename, caption }
     * @param {string} type - 'image', 'audio', 'document'
     */
    async sendMedia(to, media, type = 'document') {
        try {
            // Evolution API uses specific endpoints for media
            // /message/sendMedia/{instance}
            const url = `/message/sendMedia/${this.instanceName}`;

            const body = {
                number: to,
                options: {
                    delay: 1200,
                    presence: 'composing'
                },
                mediaMessage: {
                    mediatype: type,
                    caption: media.caption || '',
                    media: media.data, // Base64
                    fileName: media.filename || 'file'
                }
            };

            const response = await this.client.post(url, body);
            return response.data;
        } catch (error) {
            logger.error('❌ Error sending media via Evolution API', { error: error.message, data: error.response?.data });
            throw error;
        }
    }

    /**
     * Set Webhook for the instance
     * @param {string} webhookUrl - Public URL of this server
     */
    async setWebhook(webhookUrl) {
        try {
            const url = `/webhook/set/${this.instanceName}`;
            const body = {
                webhookUrl: webhookUrl,
                webhookByEvents: true,
                events: [
                    "MESSAGES_UPSERT",
                    "MESSAGES_UPDATE",
                    "SEND_MESSAGE"
                ]
            };
            await this.client.post(url, body);
            logger.info(`✅ Webhook configured for instance ${this.instanceName} -> ${webhookUrl}`);
        } catch (error) {
            // If instance doesn't exist, we might need to create it, but for now just log error
            logger.error('❌ Error setting webhook', { error: error.message });
        }
    }

    /**
     * Check if instance is connected
     */
    async checkConnection() {
        try {
            const url = `/instance/connectionState/${this.instanceName}`;
            const response = await this.client.get(url);
            return response.data?.instance?.state === 'open';
        } catch (error) {
            return false;
        }
    }
}

module.exports = new EvolutionService();
