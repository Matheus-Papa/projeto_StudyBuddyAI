import { NextResponse } from 'next/server'

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'phi3'

export async function POST(req: Request) {
  try {
    const { texto } = await req.json()

    if (!texto || typeof texto !== 'string' || texto.trim().length < 10) {
      return NextResponse.json(
        { erro: 'Texto muito curto. Cole um conteúdo com pelo menos 10 caracteres.' },
        { status: 400 }
      )
    }

    const prompt = `
Leia o texto abaixo e analise o contexto. Não gere resumo, quiz nem flashcards. Apenas identifique:

1. Tema principal do texto
2. Conceitos-chave mencionados
3. Ideia central ou argumento principal
4. Pontos importantes que merecem atenção

TEXTO:
${texto}

Responda em português do Brasil, de forma direta e objetiva.
`

    const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
    })

    if (!ollamaRes.ok) {
      return NextResponse.json(
        { erro: 'Ollama não respondeu. Verifique se está rodando em localhost:11434.' },
        { status: 502 }
      )
    }

    const data = await ollamaRes.json()

    return NextResponse.json({
      contexto: data.response || 'Não foi possível extrair o contexto.',
    })
  } catch (err: any) {
    return NextResponse.json(
      { erro: err.message || 'Erro interno ao estudar contexto.' },
      { status: 500 }
    )
  }
}
