import { NextResponse } from 'next/server'
import { callNvidia } from '@/lib/nvidia-server'

export const maxDuration = 300

export async function POST(req: Request) {
  try {
    const { texto } = await req.json()

    if (!texto || typeof texto !== 'string' || texto.trim().length < 10) {
      return NextResponse.json(
        { erro: 'Texto muito curto. Cole um conteúdo com pelo menos 10 caracteres.' },
        { status: 400 }
      )
    }

    const messages = [
      {
        role: 'system',
        content: 'Você é um assistente educacional especializado em português do Brasil. Responda de forma direta e objetiva.',
      },
      {
        role: 'user',
        content: `
Leia o texto abaixo e analise o contexto. Não gere resumo, quiz nem flashcards. Apenas identifique:

1. Tema principal do texto
2. Conceitos-chave mencionados
3. Ideia central ou argumento principal
4. Pontos importantes que merecem atenção

TEXTO:
${texto}

Responda em português do Brasil, de forma direta e objetiva.
        `,
      },
    ]

    const contexto = await callNvidia(messages, {
      temperature: 0.5,
      top_p: 0.95,
      max_tokens: 2048,
    })

    return NextResponse.json({
      contexto: contexto || 'Não foi possível extrair o contexto.',
    })
  } catch (err: any) {
    return NextResponse.json(
      { erro: err.message || 'Erro interno ao estudar contexto.' },
      { status: 500 }
    )
  }
}
