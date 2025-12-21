# Porquim 360 (V2 - Modular)

Bot Financeiro para WhatsApp com Inteligência Artificial.

## Segurança

### Row Level Security (RLS)
Este projeto utiliza o Supabase como banco de dados. Para garantir a segurança dos dados dos usuários, é **IMPRESCINDÍVEL** que o Row Level Security (RLS) esteja ativado em todas as tabelas (`perfis`, `transacoes`, etc.).

- O código utiliza `SUPABASE_ANON_KEY` para 99% das operações, o que significa que ele respeita as políticas RLS configuradas no banco.
- O `user_id` nas tabelas deve corresponder ao ID do usuário autenticado ou ao identificador do perfil.

### Variáveis de Ambiente
O sistema exige as seguintes variáveis no arquivo `.env`:
- `OPENAI_API_KEY`: Chave da API da OpenAI.
- `SUPABASE_URL`: URL do projeto Supabase.
- `SUPABASE_ANON_KEY`: Chave pública anônima.
- `SUPABASE_SERVICE_ROLE_KEY`: (Opcional) Chave de serviço para tarefas administrativas. **NUNCA exponha essa chave no cliente público.**

## Instalação

```bash
npm install
npm start
```
