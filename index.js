require('dotenv').config();
console.log("--- TESTE DE CARGA DO AMBIENTE ---");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_KEY:", process.env.SUPABASE_KEY ? "Carregada (oculta)" : "NÃO DEFINIDA");
console.log("OPENAI_KEY:", process.env.OPENAI_API_KEY ? "Carregada (oculta)" : "NÃO DEFINIDA");
console.log("----------------------------------");
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuração do FFmpeg (Estático)
const ffmpegPath = require('ffmpeg-static');
// const ffprobePath = require('ffprobe-static').path;
console.log('FFmpeg Path:', ffmpegPath);

// FORÇANDO via Variável de Ambiente
process.env.FFMPEG_PATH = ffmpegPath;

if (!fs.existsSync(ffmpegPath)) {
    console.error('❌ ERRO: FFmpeg não encontrado!');
}

// Inicialização do Cliente Supabase
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('❌ ERRO: Faltam as credenciais do SUPABASE no arquivo .env');
    process.exit(1);
}
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Configuração da OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Inicialização do Cliente WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox'],
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR Code gerado! Escaneie com seu WhatsApp.');
});

client.on('ready', () => {
    console.log('Cliente está pronto!');
});

client.on('message', async (message) => {
    try {
        console.log(`Mensagem recebida de ${message.from}: ${message.body}`);

        // Identificação do Usuário
        const user = await getOrCreateUser(message.from);
        if (!user) {
            await message.reply('❌ Erro ao identificar seu perfil no sistema.');
            return;
        }

        // 1. Comando Relatório
        if (message.body.toLowerCase() === 'relatório' || message.body.toLowerCase() === 'relatorio') {
            const report = await generateReport(user.id);
            await message.reply(report);
            return;
        }

        let textToProcess = '';

        // 2. Processamento de Mídia (Áudio e Imagem)
        if (message.hasMedia) {
            const media = await message.downloadMedia();

            // CASO 1: ÁUDIO
            if (media.mimetype.includes('audio')) {
                console.log('Recebido áudio, processando...');
                const audioPath = path.join(__dirname, `temp_audio_${Date.now()}.ogg`);
                const mp3Path = path.join(__dirname, `temp_audio_${Date.now()}.mp3`);

                fs.writeFileSync(audioPath, media.data, 'base64');

                // Conversão direta via child_process
                await new Promise((resolve, reject) => {
                    const { execFile } = require('child_process');
                    execFile(ffmpegPath, ['-i', audioPath, mp3Path], (error) => {
                        if (error) reject(error);
                        else resolve();
                    });
                });

                // Transcrição Whisper
                const transcription = await openai.audio.transcriptions.create({
                    file: fs.createReadStream(mp3Path),
                    model: "whisper-1",
                });

                textToProcess = transcription.text;
                await message.reply(`📝 Transcrição: "${textToProcess}"`);

                fs.unlinkSync(audioPath);
                fs.unlinkSync(mp3Path);
            }
            // CASO 2: IMAGEM
            else if (media.mimetype.includes('image')) {
                console.log('Recebida imagem, analisando com visão computacional...');
                await message.reply('🧐 Olhando sua notinha...');

                const systemPrompt = `Você é um assistente financeiro especializado em ler notas fiscais, recibos e anotações manuscritas.
                Extraia TODOS os itens de gasto visíveis na imagem.
                Categorias permitidas: Alimentação, Transporte, Lazer, Contas, Saúde, Outros.
                
                Retorne JSON com a chave "gastos" (lista).
                Exemplo: { "gastos": [{ "valor": 10, "categoria": "...", "descricao": "...", "data": "..." }] }
                
                Se NÃO for um comprovante de gasto, retorne { "ignorar": true, "resposta": "..." }.
                Use a data de hoje (${new Date().toISOString().split('T')[0]}) se a data da nota não estiver legível.`;

                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: systemPrompt },
                        {
                            role: "user",
                            content: [
                                { type: "text", text: "Analise este comprovante/anotação e extraia os dados do gasto." },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: `data:${media.mimetype};base64,${media.data}`
                                    }
                                }
                            ]
                        }
                    ],
                    model: "gpt-4o-mini",
                    response_format: { type: "json_object" }
                });

                const responseContent = completion.choices[0].message.content;
                await processAIResponse(responseContent, message, user.id);
                return; // Encerra aqui pois já processou via Vision
            }
        } else {
            textToProcess = message.body;
        }

        // 3. Processamento de Texto (GPT) - Apenas se não foi processado como imagem
        if (textToProcess) {
            const systemPrompt = `Você é um assistente financeiro. Receba a mensagem informal do usuário.
            Se houver MÚLTIPLOS gastos (ex: "10 pão, 20 uber"), extraia TODOS.
            Categorias permitidas: Alimentação, Transporte, Lazer, Contas, Saúde, Outros.
            
            Retorne JSON com a chave "gastos" (lista).
            Exemplo: { "gastos": [{ "valor": 10, "categoria": "...", "descricao": "...", "data": "..." }] }
            
            Se a mensagem NÃO for sobre um gasto, retorne { "ignorar": true, "resposta": "..." }.
            Use a data de hoje (${new Date().toISOString().split('T')[0]}) se não especificada.`;

            const completion = await openai.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: textToProcess }
                ],
                model: "gpt-4o-mini",
                response_format: { type: "json_object" }
            });

            const responseContent = completion.choices[0].message.content;
            let data;

            try {
                data = JSON.parse(responseContent);
            } catch (e) {
                console.error("Erro ao fazer parse do JSON da IA", e);
                return; // Ignora se a IA falhar no JSON
            }

            if (data.ignorar) {
                await message.reply(data.resposta || "🤖 Olá! Posso anotar seus gastos, só mandar!");
            } else {
                await saveTransaction(user.id, data);
                const valorFormatado = data.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                await message.reply(`✅ Gasto de ${valorFormatado} (${data.categoria}) salvo no banco!`);
            }
        }

    } catch (error) {
        console.error('Erro geral durante mensagem:', error);
    }
});

// --- FUNÇÕES DE BANCO DE DADOS (SUPABASE) ---

// Busca usuário pelo número telefônico ou cria se não existir
async function getOrCreateUser(whatsappNumber) {
    // 1. Tenta buscar
    const { data: existingUser, error: findError } = await supabase
        .from('perfis')
        .select('*')
        .eq('whatsapp_number', whatsappNumber)
        .single();

    if (existingUser) return existingUser;

    // 2. Se não existe, cria
    const { data: newUser, error: createError } = await supabase
        .from('perfis')
        .insert([{ whatsapp_number: whatsappNumber }])
        .select()
        .single();

    if (createError) {
        console.error("Erro ao criar usuário:", createError);
        return null;
    }

    console.log(`Novo usuário criado: ${whatsappNumber}`);
    return newUser;
}

// Salva transação no Supabase vinculada ao ID do usuário
async function saveTransaction(userId, transactionData) {
    const { error } = await supabase
        .from('transacoes')
        .insert([{
            user_id: userId,
            valor: transactionData.valor,
            categoria: transactionData.categoria,
            descricao: transactionData.descricao,
            data: transactionData.data
        }]);

    if (error) console.error("Erro ao salvar transação:", error);
}

// Gera relatório somando gastos do mês atual APENAS do usuário específico
async function generateReport(userId) {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth() + 1; // 1-12

    // Primeiro dia do mês
    const firstDay = new Date(ano, mes - 1, 1).toISOString().split('T')[0];
    // Último dia do mês (primeiro dia do próximo mês)
    const nextMonth = new Date(ano, mes, 1).toISOString().split('T')[0];

    const { data: transacoes, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', userId)
        .gte('data', firstDay)
        .lt('data', nextMonth);

    if (error) {
        console.error("Erro ao gerar relatório:", error);
        return "Erro ao buscar dados.";
    }

    if (!transacoes || transacoes.length === 0) {
        return "📉 Nenhun gasto encontrado neste mês.";
    }

    const total = transacoes.reduce((acc, curr) => acc + curr.valor, 0);
    const totalFormatado = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    let relatorio = `📊 *Seu Relatório (${mes}/${ano})*\n\n`;
    relatorio += `💰 *Total: ${totalFormatado}*\n\n`;

    // Agrupar por categoria
    const porCategoria = transacoes.reduce((acc, curr) => {
        acc[curr.categoria] = (acc[curr.categoria] || 0) + curr.valor;
        return acc;
    }, {});

    for (const [cat, val] of Object.entries(porCategoria)) {
        relatorio += `- ${cat}: ${val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;
    }

    return relatorio;
}

// Função auxiliar para processar e salvar a resposta da IA (usada por Texto e Imagem)
async function processAIResponse(jsonContent, message, userId) {
    let data;
    try {
        data = JSON.parse(jsonContent);
    } catch (e) {
        console.error("Erro ao fazer parse do JSON da IA", e);
        return;
    }

    if (data.ignorar) {
        await message.reply(data.resposta || "🤖 Olá! Posso anotar seus gastos, só mandar!");
        return;
    }

    // Normaliza para array, caso a IA mande apenas um objeto solto ou lista
    let gastos = [];
    if (data.gastos && Array.isArray(data.gastos)) {
        gastos = data.gastos;
    } else if (!data.gastos && data.valor) {
        gastos = [data]; // Fallback para formato antigo/único
    }

    if (gastos.length === 0) {
        await message.reply("🤔 Entendi que é um gasto, mas não consegui extrair os valores. Tente detalhar mais.");
        return;
    }

    let respostaFinal = "✅ Gastos salvos:\n";

    for (const gasto of gastos) {
        await saveTransaction(userId, gasto);
        const valorFormatado = gasto.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        respostaFinal += `- ${valorFormatado} (${gasto.categoria}): ${gasto.descricao}\n`;
    }

    await message.reply(respostaFinal);
}

client.initialize();
