const xlsx = require('xlsx');
const { analyzePdfText } = require('../services/openaiService');

class XlsxStrategy {
    async execute(message) {
        try {
            // Buffer from Base64
            const media = await message.downloadMedia();
            if (!media) return { type: 'system_error', content: "Erro ao baixar arquivo Excel." };

            const buffer = Buffer.from(media.data, 'base64');

            // Parse Workbook
            const workbook = xlsx.read(buffer, { type: 'buffer' });

            // Get first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert to CSV text for AI analysis
            const csvText = xlsx.utils.sheet_to_csv(worksheet);

            console.log("[XLSX] Convertido para texto. Enviando para IA...");
            const aiResult = await analyzePdfText(csvText);

            if (aiResult.error) {
                return { type: 'system_error', content: "Não consegui entender esse Excel." };
            }

            return {
                type: 'data_extraction',
                content: aiResult
            };

        } catch (error) {
            console.error("XLSX Strategy Error:", error);
            return { type: 'system_error', content: "Erro ao ler arquivo Excel." };
        }
    }
}

module.exports = new XlsxStrategy();
