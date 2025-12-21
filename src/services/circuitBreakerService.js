const CircuitBreaker = require('opossum');
const logger = require('./loggerService');

// Configuração padrão solicitada pelo usuário
const defaultOptions = {
    timeout: 30000, // 30 segundos
    errorThresholdPercentage: 50, // 50% de erro
    resetTimeout: 30000 // 30 segundos para tentar abrir novamente
};

/**
 * Cria um Circuit Breaker para uma função assíncrona
 * @param {Function} asyncFunction Função a ser protegida
 * @param {String} serviceName Nome do serviço para logs
 * @param {Object} options Opções customizadas (merge com default)
 */
function createBreaker(asyncFunction, serviceName = 'Service', options = {}) {
    const breaker = new CircuitBreaker(asyncFunction, { ...defaultOptions, ...options });

    breaker.fallback(() => {
        return {
            error: true,
            message: "Serviço temporariamente indisponível (Circuit Breaker Open)",
            type: "fallback"
        };
    });

    breaker.on('open', () => logger.warn(`⚠️ Circuit Breaker OPEN: ${serviceName}`));
    breaker.on('halfOpen', () => logger.info(`🔓 Circuit Breaker HALF-OPEN: ${serviceName}`));
    breaker.on('close', () => logger.info(`✅ Circuit Breaker CLOSED: ${serviceName}`));
    breaker.on('fallback', (result) => logger.warn(`🛡️ Circuit Breaker Fallback executed for ${serviceName}`));

    return breaker;
}

module.exports = { createBreaker };
