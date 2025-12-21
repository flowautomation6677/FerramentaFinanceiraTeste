const TextStrategy = require('../src/strategies/TextStrategy');

// Mock User and Memory
const mockUser = { id: 'test-user-01', nome: 'Tester' };
const mockMemory = [];

async function runTest(label, input, expectedCheck) {
    try {
        const result = await TextStrategy.execute(input, {}, mockUser, mockMemory);
        let check = false;

        if (result.type === 'ai_response' && result.data) {
            check = expectedCheck(result.data);
        } else if (result.type === 'ai_response') {
            check = expectedCheck({ content: result.content });
        } else {
            check = expectedCheck(result);
        }

        if (!check) {
            console.log(`FAIL: ${label}`);
            console.log(`Input: ${input}`);
            console.log(`Output: ${JSON.stringify(result, null, 2)}`);
        } else {
            // console.log(`PASS: ${label}`);
        }
    } catch (e) {
        console.log(`ERROR: ${label}`);
        console.log(e);
    }
}

async function main() {
    // 1. Correção de Valor
    await runTest("Correção de Valor", "Era 20 reais, quer dizer, 30.", (d) => d.gastos && d.gastos[0].valor === 30);
    // 2. Correção de Local
    await runTest("Correção de Local", "Fui no Burger King, não, foi no McDonald's.", (d) => d.gastos && d.gastos[0].descricao.toLowerCase().includes("mcdonald"));
    // 3. Cancelamento Total
    await runTest("Cancelamento Total", "Gastei 50... ah, esquece, não vou anotar nada hoje.", (d) => (!d.gastos || d.gastos.length === 0));
    // 4. Correção Dupla
    await runTest("Correção Dupla", "10 no Uber, não, 15, não, 20 porque dei gorjeta.", (d) => d.gastos && d.gastos[0].valor === 20);
    // 5. Falsa Correção
    await runTest("Falsa Correção", "Gastei 50 no almoço e não me arrependi.", (d) => d.gastos && d.gastos[0].valor === 50);
}

main();
