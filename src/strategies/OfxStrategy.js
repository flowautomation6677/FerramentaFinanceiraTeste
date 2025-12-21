const ofx = require('node-ofx-parser');

class OfxStrategy {
    async execute(message) {
        try {
            console.log("[OFX DEBUG] Downloading media...");
            const media = await message.downloadMedia();

            console.log("[OFX DEBUG] downloadMedia result:", media ? "Object Found" : "Null");
            if (media) {
                console.log("[OFX DEBUG] Mimetype:", media.mimetype);
                console.log("[OFX DEBUG] Data Length:", media.data ? media.data.length : "No Data");
            }

            if (!media || !media.data) {
                return { type: 'system_error', content: "❌ Falha no download. O WhatsApp não retornou dados para este OFX." };
            }

            const buffer = Buffer.from(media.data, 'base64');
            const ofxString = buffer.toString('utf-8');

            const data = ofx.parse(ofxString);

            // Navigate through OFX structure (It can vary slightly, but standard is similar)
            // Usually: OFX -> BANKMSGSRSV1 -> STMTTRNRS -> STMTRS -> BANKTRANLIST -> STMTTRN
            // Or CREDITCARDMSGSRSV1 for credit cards.

            let transactions = [];
            let bankTranList = null;

            // Helper to find BANKTRANLIST recursively or checking both paths
            const bankMsg = data.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST;
            const creditMsg = data.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.BANKTRANLIST;

            bankTranList = bankMsg || creditMsg;

            if (bankTranList && bankTranList.STMTTRN) {
                const rawTx = Array.isArray(bankTranList.STMTTRN) ? bankTranList.STMTTRN : [bankTranList.STMTTRN];

                transactions = rawTx.map(tx => {
                    const valor = parseFloat(tx.TRNAMT);
                    // DTPOSTED format: YYYYMMDD...
                    const rawDate = tx.DTPOSTED.substring(0, 8); // YYYYMMDD
                    const formattedDate = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;

                    return {
                        descricao: tx.MEMO || "Transação OFX",
                        valor: Math.abs(valor), // Sistema usa positivo para valor, e 'tipo' para sinal
                        tipo: valor < 0 ? 'despesa' : 'receita',
                        categoria: 'Bancário', // Default, AI logic downstream can improve? Or keep generic.
                        data: formattedDate,
                        raw_id: tx.FITID
                    };
                });
            }

            if (transactions.length === 0) {
                return { type: 'system_error', content: "Não encontrei transações neste arquivo OFX." };
            }

            const total = transactions.reduce((acc, t) => acc + (t.tipo === 'despesa' ? -t.valor : t.valor), 0);

            return {
                type: 'data_extraction',
                content: {
                    transacoes: transactions,
                    total_fatura: null, // OFX usually is account statement, not invoice
                    saldo_calculado: total
                }
            };

        } catch (error) {
            console.error("OFX Strategy Error:", error);
            return { type: 'system_error', content: "Erro ao ler arquivo OFX." };
        }
    }
}

module.exports = new OfxStrategy();
