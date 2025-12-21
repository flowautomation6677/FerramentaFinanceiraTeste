const fs = require('fs');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');
const supabase = require('../services/supabaseClient');
const { chatCompletion, analyzeImage, transcribeAudio, generateEmbedding, generateBatchEmbeddings } = require('../services/openaiService');
const imageStrategy = require('../strategies/ImageStrategy');
const audioStrategy = require('../strategies/AudioStrategy');
const pdfStrategy = require('../strategies/PdfStrategy');
const ofxStrategy = require('../strategies/OfxStrategy'); // NEW
const csvStrategy = require('../strategies/CsvStrategy'); // NEW
const xlsxStrategy = require('../strategies/XlsxStrategy'); // NEW
const textStrategy = require('../strategies/TextStrategy');
const userRepo = require('../repositories/UserRepository');
const transactionRepo = require('../repositories/TransactionRepository');

// FORÇANDO via Variável de Ambiente
process.env.FFMPEG_PATH = ffmpegPath;

// --- MAIN CONTROLLER ---
const sessionService = require('../services/sessionService');
const queueService = require('../services/queueService');
const { processExtractedData } = require('../services/dataProcessor');



async function handleMessage(message) {
    try {
        if (message.from === 'status@broadcast') return;

        const user = await userRepo.findByPhone(message.from) || await userRepo.create(message.from);
        if (!user) return message.reply('❌ Erro de Perfil.');

        // Initialize/Fetch Context from Redis
        let userContext = await sessionService.getContext(user.id);

        // Strategy Selection
        let result = null;

        // 0. State Check: Waiting for PDF Password?
        const pendingPdfBase64 = await sessionService.getPdfState(user.id);

        if (pendingPdfBase64) {
            // Assume text is password
            const password = message.body.trim();

            // Offload Password Retry to Worker
            await message.reply("⏳ Verificando senha e processando...");

            await queueService.addJob('RETRY_PDF_PASSWORD', {
                chatId: message.from,
                userId: user.id,
                mediaData: pendingPdfBase64, // The locked file
                password: password,
                filename: 'locked.pdf'
            });

            // We optimistically clear state or wait? 
            // Better to let the worker clear it on success, 
            // OR we clear it now and if it fails user has to re-upload.
            // The instructions said "pendingPdf... should be serialized/deserialized in Redis". 
            // If we remove it here, and worker fails, user has to re-send file.
            // Let's keep it in Redis. If worker succeeds, worker should clear it?
            // Shared state modification from worker ok.

            return;
        }

        if (message.hasMedia) {

            const media = await message.downloadMedia();
            if (!media) {
                return message.reply("❌ Não consegui baixar a mídia. Tente novamente.");
            }

            const base64Data = media.data;
            const mime = media.mimetype;
            const filename = media.filename || message.body || 'unknown';

            let jobType = null;

            if (message.type === 'image') {
                jobType = 'PROCESS_IMAGE';
            } else if (message.type === 'ptt' || message.type === 'audio') {
                jobType = 'PROCESS_AUDIO';
            } else if (message.type === 'document' && (mime === 'application/pdf' || filename.endsWith('.pdf'))) {
                jobType = 'PROCESS_PDF';
            } else if (message.type === 'document') {
                if (filename.endsWith('.ofx') || mime.includes('ofx')) {
                    jobType = 'PROCESS_OFX';
                } else if (filename.endsWith('.csv') || mime.includes('csv')) {
                    jobType = 'PROCESS_CSV';
                } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls') || mime.includes('excel') || mime.includes('spreadsheet')) {
                    jobType = 'PROCESS_XLSX';
                }
            }

            if (jobType) {
                await message.reply("⏳ Recebi seu arquivo! Estou processando e te aviso em instantes...");
                await queueService.addJob(jobType, {
                    chatId: message.from,
                    userId: user.id,
                    mediaData: base64Data,
                    mimeType: mime,
                    filename: filename,
                    body: message.body
                });
                return;
            }
        } else {
            result = { type: 'text_command', content: message.body };
        }

        if (!result) return;

        // --- Result Handling (Text Only) ---
        // Media results are now handled by Worker/Queue

        if (result.type === 'data_extraction') {
            // Wrapper for reply to match signature
            const reply = async (text) => await message.reply(text);
            await processExtractedData(result.content, user.id, reply);

        } else if (result.type === 'system_error') {
            await message.reply(`❌ ${result.content}`);
        } else if (result.type === 'text_command') {
            const response = await textStrategy.execute(result.content, message, user, userContext);

            if (response.type === 'ai_response' || response.type === 'tool_response') {
                const text = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
                const reply = async (text) => await message.reply(text);

                // Robust JSON Extraction
                let jsonStr = text;
                const firstBrace = text.indexOf('{');
                const lastBrace = text.lastIndexOf('}');

                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    jsonStr = text.substring(firstBrace, lastBrace + 1);
                }

                // Check if it looks like our schema before trying to process
                if (jsonStr.includes('"gastos"') || jsonStr.includes('"transacoes"') || jsonStr.includes('"valor"')) {
                    try {
                        await processExtractedData(jsonStr, user.id, reply);
                    } catch (e) {
                        console.error("JSON Processing Fail:", e);
                        await message.reply(text);
                    }
                } else {
                    await message.reply(text);
                }

                // Update context
                userContext.push({ role: "user", content: result.content });
                userContext.push({ role: "assistant", content: text });

                // Keep only last 10 messages
                if (userContext.length > 10) {
                    userContext = userContext.slice(-10);
                }

                // Save updated context to Redis with 24h TTL
                await sessionService.setContext(user.id, userContext, 86400);
            }
        }

    } catch (err) {
        console.error("❌ Controller Error:", err);
    }
}

module.exports = { handleMessage };
