🐷 Porquim 360 (V2 - Modular)

O Porquim 360 é um bot financeiro inteligente para WhatsApp que utiliza IA para automatizar a gestão de finanças pessoais. Ele permite que os usuários registrem transações enviando mensagens de texto, áudios, imagens de comprovantes ou arquivos bancários, processando tudo automaticamente e exibindo os dados em um dashboard web moderno.

🚀 Funcionalidades Principais
Processamento Inteligente (IA): Integração com OpenAI para entender intenções em mensagens de texto e transcrições de áudio.

Suporte Multi-Formato: Estratégias modulares para processar diferentes tipos de arquivos:

📄 PDF & Imagens: Leitura de comprovantes e notas fiscais.

📊 Extratos Bancários: Suporte nativo para arquivos OFX e CSV.

📑 Planilhas: Importação de dados via arquivos XLSX.

🎙️ Áudio: Transcrição e extração de dados de mensagens de voz.

Dashboard Web: Interface visual construída em Next.js para acompanhamento de gastos, gráficos e métricas em tempo real.

Arquitetura de Mensageria: Utiliza BullMQ e Redis para processamento assíncrono e resiliente de mídias pesadas.

Segurança Avançada: Implementação de Row Level Security (RLS) no Supabase para garantir a privacidade total dos dados por usuário.

🛠️ Stack Tecnológica
Backend (Bot)
Runtime: Node.js

WhatsApp: whatsapp-web.js

IA: OpenAI API

Banco de Dados: Supabase (PostgreSQL)

Fila/Cache: BullMQ & Redis

Logs: Winston com rotação diária

Frontend (Dashboard)
Framework: Next.js 15+ (App Router)

UI: Tailwind CSS, Framer Motion (animações) e Lucide React (ícones)

Gráficos: Recharts

Autenticação: Supabase SSR

📋 Pré-requisitos
Node.js (v18 ou superior)

Redis Server (para as filas de processamento)

Conta no Supabase

Chave de API da OpenAI

⚙️ Configuração
Clone o repositório:

Bash

git clone https://github.com/seu-usuario/porquim360.git
cd porquim360
Configure as variáveis de ambiente: Crie um arquivo .env na raiz do projeto e em web-dashboard/ com as seguintes chaves:

Snippet de código

OPENAI_API_KEY=sua_chave_aqui
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anon_aqui
# Opcional para tarefas admin
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
Instale as dependências e inicie o Bot:

Bash

npm install
npm start
Inicie o Dashboard:

Bash

cd web-dashboard
npm install
npm run dev
🛡️ Segurança e RLS
A segurança é tratada a nível de banco de dados através do Row Level Security (RLS) do Supabase.

Todas as tabelas (perfis, transacoes) devem ter o RLS habilitado.

As consultas utilizam a SUPABASE_ANON_KEY, respeitando o contexto do usuário autenticado.

🧪 Testes
O projeto conta com uma suíte de testes unitários e de integração:

Backend: npm test (Jest)

E2E (Dashboard): npm run test:e2e (Playwright)
