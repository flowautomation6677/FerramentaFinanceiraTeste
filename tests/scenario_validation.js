const TextStrategy = require('../src/strategies/TextStrategy');
const openaiService = require('../src/services/openaiService');

// Mock User and Memory
const mockUser = { id: 'test-user-01', nome: 'Tester' };
const mockMemory = [];

// Helper function to run a test case
async function runTest(label, input, expectedCheck) {
    console.log(`\n--- Teste: ${label} ---`);
    console.log(`Input: "${input}"`);
    try {
        const result = await TextStrategy.execute(input, {}, mockUser, mockMemory);

        // Analyze the result
        if (result.type === 'ai_response' && result.data) {
            console.log("AI Data:", JSON.stringify(result.data, null, 2));
            const check = expectedCheck(result.data);
            if (check) {
                console.log("✅ PASS");
            } else {
                console.log("❌ FAIL - Resultado inesperado");
            }
        } else if (result.type === 'ai_response') {
            // Case where it returns just text (maybe cancellation or interaction)
            console.log("AI Content:", result.content);
            const check = expectedCheck({ content: result.content });
            if (check) {
                console.log("✅ PASS");
            } else {
                console.log("❌ FAIL - Resultado inesperado");
            }
        } else {
            console.log("Result Type:", result.type);
            console.log("Content:", result.content);
            const check = expectedCheck(result);
            if (check) {
                console.log("✅ PASS");
            } else {
                console.log("❌ FAIL - Resultado inesperado");
            }
        }
    } catch (e) {
        console.error("❌ ERROR:", e);
    }
}

async function main() {
    console.log("Iniciando bateria de testes de Correção e Cancelamento...");

    // 1. Correção de Valor
    await runTest(
        "Correção de Valor",
        "Era 20 reais, quer dizer, 30.",
        (data) => data.gastos && data.gastos[0].valor === 30
    );

    // 2. Correção de Local
    await runTest(
        "Correção de Local",
        "Fui no Burger King, não, foi no McDonald's.",
        (data) => data.gastos && data.gastos[0].descricao.toLowerCase().includes("mcdonald")
    );

    // 3. Cancelamento Total
    await runTest(
        "Cancelamento Total",
        "Gastei 50... ah, esquece, não vou anotar nada hoje.",
        (data) => (!data.gastos || data.gastos.length === 0)
    );

    // 4. Correção Dupla
    await runTest(
        "Correção Dupla",
        "10 no Uber, não, 15, não, 20 porque dei gorjeta.",
        (data) => data.gastos && data.gastos[0].valor === 20
    );

    // 5. Falsa Correção
    await runTest(
        "Falsa Correção",
        "Gastei 50 no almoço e não me arrependi.",
        (data) => data.gastos && data.gastos[0].valor === 50
    );
}

main();
