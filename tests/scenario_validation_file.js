const TextStrategy = require('../src/strategies/TextStrategy');
const fs = require('fs');

// Mock User and Memory
const mockUser = { id: 'test-user-01', nome: 'Tester' };
const mockMemory = [];

let resultsLog = "";
let allPassed = true;

function log(msg) {
    console.log(msg);
    resultsLog += msg + "\n";
}

// Helper function to run a test case
async function runTest(label, input, expectedCheck) {
    log(`\n--- Teste: ${label} ---`);
    log(`Input: "${input}"`);
    try {
        const result = await TextStrategy.execute(input, {}, mockUser, mockMemory);

        let check = false;
        // Analyze the result
        if (result.type === 'ai_response' && result.data) {
            log("AI Data JSON found.");
            check = expectedCheck(result.data);
        } else if (result.type === 'ai_response') {
            log("AI Content only.");
            check = expectedCheck({ content: result.content });
        } else {
            check = expectedCheck(result);
        }

        if (check) {
            log("RESULT: PASS");
        } else {
            log("RESULT: FAIL");
            log(`Got: ${JSON.stringify(result, null, 2)}`);
            allPassed = false;
        }
    } catch (e) {
        log("RESULT: ERROR");
        log(e.toString());
        allPassed = false;
    }
}

async function main() {
    log("STARTING TESTS...");

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

    log("\n-------------------");
    if (allPassed) {
        log("FINAL SUMMARY: ALL TESTS PASSED");
    } else {
        log("FINAL SUMMARY: SOME TESTS FAILED");
    }

    fs.writeFileSync('tests/results.txt', resultsLog, 'utf8');
}

main();
