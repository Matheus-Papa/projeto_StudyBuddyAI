# projeto_StudyBuddyAI

Assistente de estudos com IA que explica textos complexos em diferentes níveis de dificuldade e gera automaticamente quiz e flashcards para revisão.

## Novo fluxo de uso

1. **Estudar contexto**: cole um texto e clique em "Estudar contexto". O Ollama analisa o texto e extrai o tema principal, conceitos-chave e ideia central — sem gerar nada ainda.
2. **Escolher tarefas**: marque o que deseja gerar (Resumo, Explicação por nível, Quiz, Flashcards — pode ser mais de uma) e selecione o nível de complexidade.
3. **Gerar materiais**: clique em "Gerar materiais selecionados" e o Ollama cria tudo de uma única chamada.
4. **Continuar com o mesmo texto**: após ver os resultados, clique em "Escolher mais tarefas" para adicionar novas funcionalidades sem precisar colar o texto novamente.
5. **Refazer / fazer diferente**: cada resultado tem um botão "Refazer" para regenerar aquele item específico. Os flashcards têm um botão "Gerar mais" para acrescentar novos cards.

## Diferença para a versão anterior

Na versão inicial, o Ollama recebia o texto e gerava tudo de uma vez (resumo, explicação, quiz e flashcards em uma única chamada). Isso tornava a resposta lenta e não permitia escolher tarefas individualmente.

Na versão atual, o fluxo é dividido: primeiro o Ollama "estuda" o texto e extrai o contexto, depois o usuário escolhe exatamente o que gerar e com qual nível de complexidade. O contexto é reutilizado para novas tarefas sem precisar colar o texto novamente.

Tudo roda **localmente** com o Ollama. Nada é enviado para nuvem e nada é salvo em banco de dados.

## Pré-requisitos

Antes de rodar o projeto, você precisa ter instalado no seu computador:

1. **Node.js** (v18 ou superior) — [nodejs.org](https://nodejs.org/)
2. **Ollama** — [ollama.com](https://ollama.com/) instalado e em execução
3. Um modelo de IA baixado no Ollama. Recomendado:

   ```bash
   ollama pull phi3
   ```

   Alternativas mais leves: `ollama pull tinyllama` ou `ollama pull qwen2.5:0.5b`

4. Verifique se o Ollama está respondendo:

   ```bash
   curl http://localhost:11434/api/generate -d '{"model":"phi3","prompt":"Olá","stream":false}'
   ```

## Como rodar localmente

```bash
# 1. Instale as dependências do Node.js
npm install

# 2. Crie o arquivo de variáveis de ambiente
cp .env.example .env.local
# (ou crie manualmente .env.local com o conteúdo do .env.example)

# 3. Rode o projeto
npm run dev
```

Abra `http://localhost:3000` no navegador.

## Segurança

- Não há chave de API de IA (o modelo roda no seu PC via Ollama).
- Não suba o arquivo `.env.local` para o GitHub (já está no `.gitignore`).
- Não commite as pastas `.next/` nem `node_modules/` (já estão no `.gitignore`).
- Toda comunicação com o Ollama acontece nas rotas de API do Next.js (`/api/estudar-contexto`, `/api/gerar-tarefas`, `/api/gerar-tarefa-unica`), nunca direto do navegador.

## Limitações

- Funciona apenas no seu computador enquanto o Ollama estiver aberto.
- Como não há banco de dados, o contexto é perdido se você recarregar a página.
- O Ollama pode demorar alguns minutos para responder em textos longos (depende do seu processador). As rotas da API estão configuradas com `maxDuration = 300` para suportar requisições longas.
- Se você quiser publicar na internet (ex: Vercel) no futuro, será necessário trocar a IA por uma API de nuvem (Gemini, Groq, etc.), porque o Ollama não roda em ambiente serverless.

## Estrutura do projeto

```
app/
  page.tsx              # Página principal com controle de fluxo (estudar -> selecionar -> exibir)
  globals.css           # Estilos globais
  layout.tsx            # Layout raiz
  api/estudar-contexto/route.ts   # Rota: analisa o texto e extrai contexto
  api/gerar-tarefas/route.ts      # Rota: gera múltiplas tarefas de uma vez
  api/gerar-tarefa-unica/route.ts # Rota: refaz uma única tarefa
components/
  StudyForm.tsx         # Formulário de texto + botão estudar contexto
  TaskSelector.tsx      # Checkboxes de tarefas + botões de nível
  ResultCard.tsx        # Card de resumo/explicação com botão refazer
  Quiz.tsx              # Quiz automático com botão refazer
  Flashcards.tsx        # Flashcards com botão gerar mais
.env.example            # Exemplo de variáveis de ambiente
.gitignore              # Arquivos ignorados pelo Git
package.json            # Dependências do Node.js
```
