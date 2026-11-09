import { NextResponse } from 'next/server'
import { handleOllamaStream } from '@/lib/ollama-server'

export const maxDuration = 300

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'phi3'

export async function POST(req: Request) {
  try {
    const { contexto, nivel, tarefa } = await req.json()

    if (!contexto || !nivel || !tarefa) {
      return new Response(
        JSON.stringify({ erro: 'Contexto, nível e tarefa são obrigatórios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const prompts: Record<string, string> = {
      resumo: `Contexto: ${contexto}\nNível: ${nivel}\nGere um resumo conciso do texto. Responda APENAS com o texto do resumo, sem JSON.`,
      explicacao: `Contexto: ${contexto}\nNível: ${nivel}\nGere uma explicação do conteúdo adaptada para o nível ${nivel}. Responda APENAS com o texto da explicação, sem JSON.`,
      quiz: `Contexto: ${contexto}\nNível: ${nivel}\nGere 3 questões de múltipla escolha. Cada uma com: pergunta, 4 alternativas e índice da correta (0-3). Responda APENAS com um array JSON válido.`,
      flashcards: `Contexto: ${contexto}\nNível: ${nivel}\nGere 3 flashcards (pergunta e resposta). Responda APENAS com um array JSON válido de objetos com "pergunta" e "resposta".`,
    }

    const prompt = prompts[tarefa] || prompts.resumo

    return handleOllamaStream(req, {
      prompt,
      format: 'json',
      onResult: (fullText) => {
        const raw = fullText || ''
        let resultado: any = ''
        try {
          resultado = JSON.parse(raw)
        } catch {
          resultado = raw
        }
        return { [tarefa]: resultado }
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { erro: err.message || 'Erro ao refazer tarefa.' },
      { status: 500 }
    )
  }
}
