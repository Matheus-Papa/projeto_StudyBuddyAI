interface ProgressBarProps {
  progress: number
  status?: 'idle' | 'estudando' | 'gerando'
  label?: string
}

const labels: Record<string, string> = {
  estudando: 'Estudando o conteúdo com o Ollama...',
  gerando: 'Gerando seus materiais com o Ollama...',
}

export default function ProgressBar({ progress, status, label }: ProgressBarProps) {
  // Esconde quando não há nada acontecendo ou já terminou.
  if (progress <= 0 || progress >= 100) return null

  const pct = Math.round(progress)
  const title = label || labels[status || ''] || 'Processando...'

  return (
    <div className="progress-container">
      <div className="progress-header">
        <span className="progress-title">{title}</span>
        <span className="progress-pct">{pct}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
