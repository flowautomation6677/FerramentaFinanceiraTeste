const { formatToDisplay } = require('../utils/dateUtility');

const FormatterService = {

    /**
     * Formata mensagem de sucesso para registro de transação
     */
    formatSuccessMessage(gasto) {
        const valor = this.formatCurrency(gasto.valor);
        const titulo = gasto.tipo === 'receita' ? '✅ Entrada Registrada!' : '✅ Gasto Registrado!';
        const dataDisplay = formatToDisplay(gasto.data);

        return `${titulo}\n\n` +
            `🪙 ${gasto.categoria} (${gasto.descricao})\n` +
            `💰 ${valor}\n` +
            `🗓️ ${dataDisplay}\n\n`;
    },

    /**
     * Formata valor monetário (BRL)
     */
    formatCurrency(value) {
        return Math.abs(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },

    /**
     * Formata mensagem de erro padrão
     */
    formatErrorMessage(msg) {
        return `❌ ${msg}`;
    },

    /**
     * Gera resumo financeiro visual (Placeholder para uso futuro)
     */
    formatFinancialSummary(resumo) {
        // Implementar lógica de lista/tabela se necessário
        return "Resumo ainda não implementado.";
    }
};

module.exports = FormatterService;
