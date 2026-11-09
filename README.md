# projeto_StudyBuddyAI

Assistente de estudos com IA que explica textos complexos em diferentes níveis de dificuldade e gera automaticamente quiz e flashcards para revisão.

## Novo fluxo de uso

1. **Estudar contexto**: cole um texto e clique em "Estudar contexto". A IA analisa o texto e extrai o tema principal, conceitos-chave e ideia central — sem gerar nada ainda.
2. **Escolher tarefas**: marque o que deseja gerar (Resumo, Explicação por nível, Quiz, Flashcards — pode ser mais de uma) e selecione o nível de complexidade.
3. **Gerar materiais**: clique em "Gerar materiais selecionados" e a IA cria tudo de uma única chamada.
4. **Continuar com o mesmo texto**: após ver os resultados, clique em "Escolher mais tarefas" para adicionar novas funcionalidades sem precisar colar o texto novamente.
5. **Refazer / fazer diferente**: cada resultado tem um botão "Refazer" para regenerar aquele item específico. Os flashcards têm um botão "Gerar mais" para acrescentar novos cards.

## Diferença para a versão anterior

Na versão inicial, o Ollama local recebia o texto e gerava tudo de uma vez (resumo, explicação, quiz e flashcards em uma única chamada). Isso tornava a resposta lenta e não permitia escolher tarefas individualmente.

Na versão atual, o fluxo é dividido: primeiro a IA "estuda" o texto e extrai o contexto, depois o usuário escolhe exatamente o que gerar e com qual nível de complexidade. O contexto é reutilizado para novas tarefas sem precisar colar o texto novamente.

## Recursos adicionais

- **Dark mode**: alterne entre tema claro e escuro no botão no canto superior direito. A preferência é salva no navegador.
- **Exportar PDF**: na tela de resultados, clique em "Exportar PDF" para baixar todos os materiais gerados em um arquivo PDF.

## Provedor de IA

O projeto usa a **NVIDIA DeepSeek (deepseek-v4.1-flash)** via API na nuvem (`https://integrate.api.nvidia.com/v1`).

Tudo roda **via API da NVIDIA**. Não é enviado para o Ollama local e nada é salvo em banco de dados.

## Pré-requisitos

Antes de rodar o projeto, você precisa ter instalado no seu computador:

1. **Node.js** (v18 ou superior) — [nodejs.org](https://nodejs.org/)
2. **Conta na NVIDIA** com API Key gerada — [build.nvidia.com](https://build.nvidia.com/)

## Como rodar localmente

```bash
# 1. Instale as dependências do Node.js
npm install

# 2. Crie o arquivo de variáveis de ambiente
cp .env.example .env.local
# Edite o .env.local e preencha sua NVIDIA_API_KEY:
# NVIDIA_API_KEY=sua_chave_aqui

# 3. Rode o projeto
npm run dev
```

Abra `http://localhost:3000` no navegador.

## Segurança

- Não há chave de API exposta no front-end. A `NVIDIA_API_KEY` fica apenas no servidor (`.env.local`).
- Não suba o arquivo `.env.local` para o GitHub (já está no `.gitignore`).
- Não commite as pastas `.next/` nem `node_modules/` (já estão no `.gitignore`).
- Toda comunicação com a NVIDIA acontece nas rotas de API do Next.js (`/api/estudar-contexto`, `/api/gerar-tarefas`, `/api/gerar-tarefa-unica`), nunca direto do navegador.

## Limitações

- Requer conexão com a internet para chamar a API da NVIDIA.
- Como não há banco de dados, o contexto é perdido se você recarregar a página.
- A NVIDIA pode demorar alguns segundos a minutos para responder em textos longos. As rotas da API estão configuradas com `maxDuration = 300` para suportar requisições longas.
- O free endpoint da NVIDIA pode ter limite de requisições por minuto/dia.

## Estrutura do projeto

```
app/
  page.tsx              # Página principal com controle de fluxo (estudar -> selecionar -> exibir)
  globals.css           # Estilos globais
  layout.tsx            # Layout raiz
  lib/nvidia-server.ts  # Cliente da API da NVIDIA (DeepSeek)
  api/estudar-contexto/route.ts   # Rota: analisa o texto e extrai contexto
  api/gerar-tarefas/route.ts      # Rota: gera múltiplas tarefas de uma vez
  api/gerar-tarefa-unica/route.ts # Rota: refaz uma única tarefa
components/
  StudyForm.tsx         # Formulário de texto + botão estudar contexto
  TaskSelector.tsx      # Checkboxes de tarefas + botões de nível
  ResultCard.tsx        # Card de resumo/explicação com botão refazer
  Quiz.tsx              # Quiz automático com botão refazer
  Flashcards.tsx        # Flashcards com botão gerar mais
  DarkModeToggle.tsx    # Alternar tema claro/escuro
  ExportPdfButton.tsx   # Exportar materiais para PDF
.env.example            # Exemplo de variáveis de ambiente
.gitignore              # Arquivos ignorados pelo Git
package.json            # Dependências do Node.js
```
