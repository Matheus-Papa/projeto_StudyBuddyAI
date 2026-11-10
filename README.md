# projeto_StudyBuddyAI

Assistente de estudos com IA que explica textos complexos em diferentes níveis de dificuldade e gera automaticamente quiz e flashcards para revisão. Usa a API da NVIDIA (NIM) como provedor de IA.

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

O projeto usa a **API da NVIDIA (NIM)** como provedor de IA. Nada é salvo em banco de dados.

## Pré-requisitos

Antes de rodar o projeto, você precisa ter instalado no seu computador:

1. **Node.js** (v18 ou superior) — [nodejs.org](https://nodejs.org/)

Você também precisa de uma chave de API da NVIDIA (NIM). Gere a sua própria chave em [build.nvidia.com/deepseek-ai/deepseek-v4.1-flash](https://build.nvidia.com/deepseek-ai/deepseek-v4.1-flash) e insira na variável `NVIDIA_API_KEY` do `.env.local`.

## Como rodar localmente

```bash
# 1. Instale as dependências do Node.js
npm install

# 2. Crie o arquivo de variáveis de ambiente
cp .env.example .env.local
# Edite o .env.local com sua chave da NVIDIA:
# NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
# NVIDIA_API_KEY=sua_chave_aqui
# NVIDIA_MODEL=meta/muse-glimmer-30b

# 3. Rode o projeto
npm run dev
```

Abra `http://localhost:3000` no navegador.

## Limitações

- Requer uma chave de API válida da NVIDIA para funcionar.
- Como não há banco de dados, o contexto é perdido se você recarregar a página.
- A NVIDIA pode demorar alguns segundos a minutos para responder em textos longos. As rotas da API estão configuradas com `maxDuration = 300` para suportar requisições longas.

## Estrutura do projeto

```
app/
  page.tsx              # Página principal com controle de fluxo (estudar -> selecionar -> exibir)
  globals.css           # Estilos globais
  layout.tsx            # Layout raiz
  lib/nvidia-server.ts  # Cliente da API da NVIDIA (servidor)
  api/estudar-contexto/route.ts   # Rota: analisa o texto e extrai contexto
  api/gerar-tarefas/route.ts      # Rota: gera múltiplas tarefas de uma vez
  api/gerar-tarefa-unica/route.ts # Rota: refaz uma única tarefa
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
