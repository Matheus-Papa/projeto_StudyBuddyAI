# projeto_StudyBuddyAI

Assistente de estudos com IA que explica textos complexos em diferentes níveis de dificuldade e gera automaticamente quiz e flashcards para revisão. Tudo roda localmente com o Ollama.

## Fluxo de uso

1. **Estudar contexto**: cole um texto e clique em "Estudar contexto". A IA analisa o texto e extrai o tema principal, conceitos-chave e ideia central — sem gerar nada ainda.
2. **Escolher tarefas**: marque o que deseja gerar (Resumo, Explicação por nível, Quiz, Flashcards — pode ser mais de uma) e selecione o nível de complexidade.
3. **Gerar materiais**: clique em "Gerar materiais selecionados" e a IA cria tudo de uma única chamada.
4. **Continuar com o mesmo texto**: após ver os resultados, clique em "Escolher mais tarefas" para adicionar novas funcionalidades sem precisar colar o texto novamente.
5. **Refazer / fazer diferente**: cada resultado tem um botão "Refazer" para regenerar aquele item específico. Os flashcards têm um botão "Gerar mais" para acrescentar novos cards.

## Recursos adicionais

- **Barra de progresso**: aparece enquanto a IA está estudando o conteúdo ou gerando os materiais.
- **Dark mode**: alterne entre tema claro e escuro no botão no canto superior direito.
- **Exportar PDF**: na tela de resultados, clique em "Exportar PDF" para baixar todos os materiais gerados em um arquivo PDF.

## Provedor de IA

O projeto usa o **Ollama local** (`http://localhost:11434` por padrão). Nada é enviado para APIs externas e nada é salvo em banco de dados.

## Pré-requisitos

Antes de rodar o projeto, você precisa ter instalado no seu computador:

1. **Node.js** (v18 ou superior) — [nodejs.org](https://nodejs.org/)
2. **Ollama** rodando localmente — [ollama.com](https://ollama.com/)

O modelo padrão é o `phi3`, mas pode ser alterado via variável de ambiente.

## Como rodar localmente

```bash
# 1. Instale as dependências do Node.js
npm install

# 2. Crie o arquivo de variáveis de ambiente
cp .env.example .env.local
# Edite o .env.local se quiser ajustar:
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=phi3

# 3. Rode o projeto
npm run dev
```

Abra `http://localhost:3000` no navegador.

## Segurança

- Não há chave de API exposta no front-end. Toda comunicação com o Ollama acontece nas rotas de API do Next.js (`/api/estudar-contexto`, `/api/gerar-tarefas`, `/api/gerar-tarefa-unica`), nunca direto do navegador.
- Não suba o arquivo `.env.local` para o GitHub (já está no `.gitignore`).
- Não commite as pastas `.next/` nem `node_modules/` (já estão no `.gitignore`).

## Limitações

- Requer o Ollama rodando localmente para funcionar.
- Como não há banco de dados, o contexto é perdido se você recarregar a página.
- O Ollama pode demorar alguns segundos a minutos para responder em textos longos. As rotas da API estão configuradas com `maxDuration = 300` para suportar requisições longas.

## Estrutura do projeto

```
app/
  page.tsx              # Página principal com controle de fluxo (estudar -> selecionar -> exibir)
  globals.css           # Estilos globais
  layout.tsx            # Layout raiz
  lib/ollama-server.ts  # Cliente streaming da API do Ollama (servidor)
  lib/ollama-client.ts  # Cliente streaming da API do Ollama (navegador)
  api/estudar-contexto/route.ts   # Rota: analisa o texto e extrai contexto
  api/gerar-tarefas/route.ts      # Rota: gera múltiplas tarefas de uma vez
  api/gerar-tarefa-unica/route.ts # Rota: refaz uma única tarefa
  api/generate/route.ts           # Rota: generate genérico
components/
  StudyForm.tsx         # Formulário de texto + botão estudar contexto
  TaskSelector.tsx      # Checkboxes de tarefas + botões de nível
  ProgressBar.tsx       # Barra de progresso durante o processamento
  ResultCard.tsx        # Card de resumo/explicação com botão refazer
  Quiz.tsx              # Quiz automático com botão refazer
  Flashcards.tsx        # Flashcards com botão gerar mais
  DarkModeToggle.tsx    # Alternar tema claro/escuro
  ExportPdfButton.tsx   # Exportar materiais para PDF
.env.example            # Exemplo de variáveis de ambiente
.gitignore              # Arquivos ignorados pelo Git
package.json            # Dependências do Node.js
```
