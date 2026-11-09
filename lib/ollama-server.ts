import { NextResponse } from 'next/server'

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'phi3'

export type OllamaServerEvent =
  | { type: 'progress'; progress: number }
  | { type: 'done'; text: string }
  | { type: 'error'; erro: string }

/**
 * Faz streaming da resposta do Ollama e chama onEvent a cada chunk
 * recebido (progresso real de transferência) e ao terminar (done).
 * Retorna o texto completo acumulado.
 */
export async function ollamaStream(
  prompt: string,
  opts: { format?: 'json' },
  onEvent: (event: OllamaServerEvent) => void
): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: true,
      ...(opts.format ? { format: opts.format } : {}),
    }),
  })

  if (!res.ok || !res.body) {
    const msg = 'Ollama não respondeu. Verifique se está rodando em localhost:11434.'
    onEvent({ type: 'error', erro: msg })
    throw new Error(msg)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''
  let chunks = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      let nl: number
      while ((nl = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, nl).trim()
        buffer = buffer.slice(nl + 1)
        if (!line) continue
        try {
          const parsed = JSON.parse(line)
          if (parsed.response) {
            fullText += parsed.response
            chunks++
            // Progresso real baseado nos chunks recebidos: começa baixo (~5%)
            // e sobe gradualmente até 90% antes do done. Assim não fica
            // travado em um valor alto quando o Ollama envia poucos chunks.
            const progress = Math.min(90, 5 + chunks * 4)
            onEvent({ type: 'progress', progress })
          }
          if (parsed.done) {
            onEvent({ type: 'done', text: fullText })
            return fullText
          }
        } catch {
          // Linha inválida do Ollama, ignora e segue.
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  onEvent({ type: 'done', text: fullText })
  return fullText
}

/**
 * Envolve uma rota da API em um SSE (text/event-stream) que espelha o
 * progresso do Ollama em tempo real e envia o resultado final no evento done.
 */
export async function handleOllamaStream(
  req: Request,
  params: {
    prompt: string
    format?: 'json'
    onResult: (fullText: string) => Record<string, any>
  }
): Promise<Response> {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      try {
        const fullText = await ollamaStream(params.prompt, { format: params.format }, (event) => {
          if (event.type === 'progress') send({ type: 'progress', progress: event.progress })
          else if (event.type === 'error') send({ type: 'error', erro: event.erro })
        })
        send({ type: 'done', ...params.onResult(fullText) })
      } catch (err: any) {
        send({ type: 'error', erro: err.message || 'Erro interno.' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
