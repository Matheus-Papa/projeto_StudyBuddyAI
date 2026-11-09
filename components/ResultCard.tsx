interface ResultCardProps {
  titulo: string
  conteudo: string
  tarefa: string
  onRefazer: (tarefa: string) => void
  loading: boolean
}

export default function ResultCard({ titulo, conteudo, tarefa, onRefazer, loading }: ResultCardProps) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          {titulo}
        </h2>
        <button
          onClick={() => onRefazer(tarefa)}
          disabled={loading}
          style={{
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            color: '#475569',
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          Refazer
        </button>
      </div>
      <div className="conteudo" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.75, color: '#334155', fontSize: '1rem' }}>
        {conteudo}
      </div>
    </div>
  )
}
