import { NextResponse } from 'next/server'
import { callNvidia } from '@/lib/nvidia-server'

export const maxDuration = 300

export async function POST(req: Request) {
  try {
    const { contexto, nivel, tarefa } = await req.json()

    if (!contexto || !nivel || !tarefa) {
      return NextResponse.json(
        { erro: 'Contexto, nível e tarefa são obrigatórios.' },
        { status: 400 }
      )
    }

    const prompts: Record<string, string> = {
      resumo: `Contexto: ${contexto}\nNível: ${nivel}\nGere um resumo conciso do texto. Responda APENAS com o texto do resumo, sem JSON.`,
      explicacao: `Contexto: ${contexto}\nNível: ${nivel}\nGere uma explicação do conteúdo adaptada para o nível ${nivel}. Responda APENAS com o texto da explicação, sem JSON.`,
      quiz: `Contexto: ${contexto}\nNível: ${nivel}\nGere 3 questões de múltipla escolha. Cada uma com: pergunta, 4 alternativas e índice da correta (0-3). Responda APENAS com um array JSON válido.`,
      flashcards: `Contexto: ${contexto}\nNível: ${nivel}\nGere 3 flashcards (pergunta e resposta). Responda APENAS com um array JSON válido de objetos com "pergunta" e "resposta".`,
    }

    const prompt = prompts[tarefa] || prompts.resumo

    const messages = [
      {
        role: 'system',
        content: 'Você é um assistente educacional especializado em português do Brasil.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ]

    const raw = await callNvidia(messages, {
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 4096,
      format: tarefa === 'resumo' || tarefa === 'explicacao' ? 'text' : 'json',
    })

    let resultado: any = ''
    try {
      resultado = JSON.parse(raw)
    } catch {
      resultado = raw
    }

    return NextResponse.json({ [tarefa]: resultado })
  } catch (err: any) {
    return NextResponse.json(
      { erro: err.message || 'Erro ao refazer tarefa.' },
      { status: 500 }
    )
  }
}
