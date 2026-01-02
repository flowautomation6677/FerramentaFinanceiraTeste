
const pdfStrategy = require('../src/strategies/PdfStrategy');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib'); // Using pdf-lib to generate a dummy PDF for testing

async function test() {
    console.log("Creating dummy PDF...");
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText('Hello World! This is a test PDF for security check.');
    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    console.log("Testing PdfStrategy.processPdf...");
    try {
        const result = await pdfStrategy.processPdf(buffer);
        console.log("Result:", result);
        if (result.success && result.text.includes("Hello World")) {
            console.log("✅ PDF Strategy works with new library version!");
            process.exit(0);
        } else {
            console.error("❌ PDF Strategy failed or text mismatch.");
            process.exit(1);
        }
    } catch (error) {
        console.error("❌ Crash during PDF processing:", error);
        process.exit(1);
    }
}

test();
