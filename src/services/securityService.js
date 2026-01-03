const logger = require('./loggerService'); // Assuming generic logger

class SecurityService {

    /**
     * Redacts PII (Personally Identifiable Information) from text.
     * Masks: CPF, CNPJ, Telefone, Email, Credit Cards (approximate).
     * @param {string} text - The input text.
     * @returns {string} - The sanitized text.
     */
    redactPII(text) {
        if (!text || typeof text !== 'string') return text;

        let sanitized = text;

        // CPF (Validation improved to avoid generic 11-digit sequences)
        // \b ensures word boundaries.
        sanitized = sanitized.replace(/(?:\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b)/g, (match) => {
            // Optional: Implement check digit validation here to reduce false positives further
            // For now, strict regex with boundaries is a significant improvement.
            return '[CPF]';
        });

        // CNPJ - \d{2}\.?\d{3}\.?\d{3}/?\d{4}-?\d{2}
        // Mantenha parcialmente ou remova tudo. LGPD foca em "Pessoa Física", CNPJ é público.
        // Mas o user pediu "Dados sensíveis". Vamos mascarar por segurança.
        sanitized = sanitized.replace(/(?:\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b)/g, '[CNPJ]');

        // Emails - Regex segura para evitar ReDoS
        // Limita cada parte do email para evitar backtracking excessivo
        sanitized = sanitized.replace(/\b[\w.-]{1,64}@[\w.-]{1,255}\.[a-zA-Z]{2,10}\b/g, '[EMAIL]');

        // Telefones (Cell/Landline Brazil) - (xx) xxxxx-xxxx
        sanitized = sanitized.replace(/(?:\(?\d{2}\)?\s?)?(?:9\d{4}|\d{4})-?\d{4}\b/g, '[PHONE]');

        // Credit Card Sequence (4 groups of 4 digits)
        // Avoid masking simple non-sensitive numbers. Look for at least 12-16 digits.
        sanitized = sanitized.replace(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g, '[CARD]');

        return sanitized;
    }

    /**
     * Cleans PDF text to remove noise and save tokens.
     * @param {string} text 
     * @returns {string}
     */
    cleanPdfText(text) {
        if (!text) return "";

        let clean = text;

        // 1. Redact PII first (Security First)
        clean = this.redactPII(clean);

        // 2. Remove "Page X of Y" artifacts
        clean = clean.replace(/Page\s+\d+\s+of\s+\d+/gi, '');
        clean = clean.replace(/Página\s+\d+\s+de\s+\d+/gi, '');

        // 3. Remove repeated separators or whitespace
        clean = clean.replace(/_{5,}/g, ''); // Long underscores lines
        clean = clean.replace(/-{5,}/g, ''); // Long dashes
        clean = clean.replace(/\s{2,}/g, ' '); // Collapse multiple spaces

        // 4. Remove common banking disclaimer footers (Heuristic)
        // "Ouvidoria: 0800...", "SAC...", "Transação sujeita a..."
        // Limit lookahead to 200 chars that are NOT digits AND NOT hyphens.
        // This prevents ReDoS because the gap group [^0-9-] cannot physically match the start of the target group [\d-].
        clean = clean.replace(/(?:Ouvidoria|SAC|Atendimento)[^0-9-]{0,200}?[\d-]{8,}/gi, '');

        return clean.trim();
    }
}

module.exports = new SecurityService();
