import { NextResponse } from 'next/server'
import { handleOllamaStream } from '@/lib/ollama-server'

export const maxDuration = 300

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'phi3'

export async function POST(req: Request) {
  try {
    const { contexto, nivel, tarefas } = await req.json()

    if (!contexto || !nivel || !Array.isArray(tarefas) || tarefas.length === 0) {
      return new Response(
        JSON.stringify({ erro: 'Contexto, nível e tarefas são obrigatórios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const tarefasDesc = {
      resumo: '- "resumo": string com um resumo conciso do texto',
      explicacao: `- "explicacao": string explicando o conteúdo adaptado para o nível ${nivel}`,
      quiz: '- "quiz": array de 3 objetos, cada um com: pergunta (string), alternativas (array de 4 strings), resposta_correta (número 0-3)',
      flashcards: '- "flashcards": array de 3 objetos, cada um com: pergunta (string), resposta (string)',
    }

    const chavesSolicitadas = tarefas.map(t => tarefasDesc[t as keyof typeof tarefasDesc]).join('\n')

    const prompt = `
Contexto do texto já estudado:
${contexto}

Nível de ensino: ${nivel}

Tarefas solicitadas: ${tarefas.join(', ')}

Gere um objeto JSON válido contendo APENAS as chaves das tarefas solicitadas:
${chavesSolicitadas}

Responda APENAS com o JSON válido. Não use markdown, não adicione texto antes ou depois.
`

    return handleOllamaStream(req, {
      prompt,
      format: 'json',
      onResult: (fullText) => {
        const rawResponse = fullText || ''
        let parsed: any = {}
        try {
          parsed = JSON.parse(rawResponse)
        } catch {
          const match = rawResponse.match(/\{[\s\S]*\}/)
          if (match) {
            try {
              parsed = JSON.parse(match[0])
            } catch {
              parsed = {}
            }
          }
        }

        const resultado: any = {}
        if (tarefas.includes('resumo')) resultado.resumo = parsed.resumo || 'Resumo não gerado.'
        if (tarefas.includes('explicacao')) resultado.explicacao = parsed.explicacao || 'Explicação não gerada.'
        if (tarefas.includes('quiz')) resultado.quiz = Array.isArray(parsed.quiz) ? parsed.quiz : []
        if (tarefas.includes('flashcards')) resultado.flashcards = Array.isArray(parsed.flashcards) ? parsed.flashcards : []

        return resultado
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { erro: err.message || 'Erro interno ao gerar tarefas.' },
      { status: 500 }
    )
  }
}
