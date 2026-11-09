import { NextResponse } from 'next/server'

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'phi3'

const PROMPT_TEMPLATE = (texto: string, nivel: string) => `
Você é um assistente educacional em português do Brasil.
Nível de ensino: ${nivel}

Texto: ${texto}

Gere um JSON com estas chaves:
- "resumo": resumo conciso do texto
- "explicacao": explicação adaptada para o nível ${nivel}
- "quiz": array com 3 perguntas. Cada uma tem: pergunta, alternativas (4 opções), resposta_correta (0-3)
- "flashcards": array com 3 pares de pergunta/resposta

Responda APENAS com o JSON válido. Não use markdown.
`

export async function POST(req: Request) {
  try {
    const { texto, nivel } = await req.json()

    if (!texto || typeof texto !== 'string' || texto.trim().length < 10) {
      return NextResponse.json(
        { erro: 'Texto muito curto. Cole um conteúdo com pelo menos 10 caracteres.' },
        { status: 400 }
      )
    }

    const prompt = PROMPT_TEMPLATE(texto, nivel)

    const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        format: 'json',
      }),
    })

    if (!ollamaRes.ok) {
      return NextResponse.json(
        { erro: 'Ollama não respondeu. Verifique se ele está rodando em localhost:11434.' },
        { status: 502 }
      )
    }

    const ollamaData = await ollamaRes.json()
    const rawResponse = ollamaData.response || ''

    let parsed: any = {}
    try {
      parsed = JSON.parse(rawResponse)
    } catch {
      const match = rawResponse.match(/\{[\s\S]*\}/)
      if (match) {
        try {
          parsed = JSON.parse(match[0])
        } catch {
          parsed = {
            resumo: rawResponse,
            explicacao: '',
            quiz: [],
            flashcards: [],
          }
        }
      } else {
        parsed = {
          resumo: rawResponse,
          explicacao: '',
          quiz: [],
          flashcards: [],
        }
      }
    }

    return NextResponse.json({
      resumo: parsed.resumo || 'Resumo não gerado.',
      explicacao: parsed.explicacao || 'Explicação não gerada.',
      quiz: Array.isArray(parsed.quiz) ? parsed.quiz : [],
      flashcards: Array.isArray(parsed.flashcards) ? parsed.flashcards : [],
    })
  } catch (err: any) {
    return NextResponse.json(
      { erro: err.message || 'Erro interno ao processar a requisição.' },
      { status: 500 }
    )
  }
}
