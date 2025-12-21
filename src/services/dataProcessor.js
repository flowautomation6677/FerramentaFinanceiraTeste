const transactionRepo = require('../repositories/TransactionRepository');
const { generateBatchEmbeddings } = require('../services/openaiService');
const { formatToISO } = require('../utils/dateUtility');
const FormatterService = require('../services/formatterService');

// --- DATA PROCESSOR (Batch Optimization) ---
// replyCallback(text) -> Promise<void>
async function processExtractedData(content, userId, replyCallback) {
    let data;
    try {
        data = typeof content === 'string' ? JSON.parse(content.replace(/```json|```/g, '').trim()) : content;
        if (typeof data === 'string') data = JSON.parse(data);
    } catch { return; }

    if (data.pergunta) return replyCallback(data.pergunta);
    if (data.ignorar) return replyCallback(data.resposta || "🤖 Olá!");

    const transacoes = data.transacoes || data.gastos || (data.valor ? [data] : []);
    const totalFatura = data.total_fatura;

    // Se não achou transações mas achou TOTAL DA FATURA, sugere registrar o pagamento da fatura
    if (!transacoes.length && totalFatura) {
        transacoes.push({
            descricao: `Pagamento de Fatura (Venc: ${data.vencimento || '?'})`,
            valor: totalFatura,
            categoria: "Pagamento de Fatura",
            tipo: "despesa",
            data: data.vencimento || new Date().toISOString().split('T')[0]
        });
    }

    if (!transacoes.length) return replyCallback("🤔 Não encontrei transações nem valor total nesta fatura.");

    // 1. Prepare Data & Descriptions
    const validItems = [];
    const textsForEmbedding = [];

    for (const g of transacoes) {
        if (!g.valor) continue;
        g.descricao = g.descricao || "Item";
        g.categoria = g.categoria || "Outros";
        // Ensure dataFormatted is ISO for DB consistency if needed, 
        // essentially g.data needs to be valid.
        // formatToISO handles parsing.

        validItems.push(g);
        textsForEmbedding.push(`${g.descricao} - ${g.categoria}`);
    }

    if (validItems.length === 0) return replyCallback("🤔 Nenhum valor válido encontrado.");

    // 2. Batch Embeddings (Optimized API Call)
    const embeddings = await generateBatchEmbeddings(textsForEmbedding);

    // 3. Prepare Batch Insert payload
    const payload = validItems.map((g, idx) => ({
        user_id: userId,
        valor: g.valor,
        categoria: g.categoria,
        descricao: g.descricao,
        data: formatToISO(g.data), // Use new ISO formatter
        tipo: g.tipo || 'despesa',
        embedding: embeddings[idx] // Match index
    }));

    // 4. Perform Batch Insert (Optimized DB Call)
    const savedTxs = await transactionRepo.createMany(payload);

    // 5. Build Response
    let response = "";
    if (savedTxs && savedTxs.length > 0) {
        savedTxs.forEach((tx, idx) => {
            response += FormatterService.formatSuccessMessage(payload[idx]);
        });
        await replyCallback(response.trim());
    } else {
        await replyCallback(FormatterService.formatErrorMessage("Erro ao salvar dados."));
    }
}

module.exports = { processExtractedData };
