export type OllamaClientEvent =
  | { type: 'progress'; progress: number }
  | { type: 'done'; payload: Record<string, any> }
  | { type: 'error'; erro: string }

/**
 * Faz POST com body JSON e lê o stream SSE da resposta, chamando onEvent
 * para cada evento de progresso/erro/done. Resolve com o payload do done.
 */
export async function postOllamaStream(
  url: string,
  body: any,
  onEvent: (event: OllamaClientEvent) => void
): Promise<Record<string, any> | null> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({}))
    const msg = err.erro || 'Erro na requisição.'
    onEvent({ type: 'error', erro: msg })
    throw new Error(msg)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      let sep: number
      // Mensagens SSE são separadas por linha em branco (\n\n)
      while ((sep = buffer.indexOf('\n\n')) >= 0) {
        const block = buffer.slice(0, sep)
        buffer = buffer.slice(sep + 2)

        let dataStr = ''
        for (const line of block.split('\n')) {
          if (line.startsWith('data: ')) dataStr = line.slice(6)
        }
        if (!dataStr) continue

        try {
          const event = JSON.parse(dataStr)
          if (event.type === 'progress') {
            onEvent({ type: 'progress', progress: event.progress })
          } else if (event.type === 'done') {
            onEvent({ type: 'done', payload: event })
            return event
          } else if (event.type === 'error') {
            onEvent({ type: 'error', erro: event.erro })
            throw new Error(event.erro)
          }
        } catch {
          // Linha SSE inválida, ignora.
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return null
}
