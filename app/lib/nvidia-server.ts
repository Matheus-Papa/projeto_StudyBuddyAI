export const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1'
export const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'meta/muse-glimmer-30b'

export interface NvidiaMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function callNvidia(
  messages: NvidiaMessage[],
  opts?: {
    temperature?: number
    top_p?: number
    max_tokens?: number
    format?: 'json' | 'text'
  }
): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY não configurada. Defina no .env.local.')
  }

  const body: any = {
    model: NVIDIA_MODEL,
    messages,
    temperature: opts?.temperature ?? 0.7,
    top_p: opts?.top_p ?? 0.95,
    max_tokens: opts?.max_tokens ?? 4096,
  }

  if (opts?.format === 'json') {
    body.response_format = { type: 'json_object' }
  }

  const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errorText = await res.text().catch(() => '')
    throw new Error(`NVIDIA API error (${res.status}): ${errorText}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}
