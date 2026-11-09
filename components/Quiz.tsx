interface Questao {
  pergunta: string
  alternativas: string[]
  resposta_correta: number
}

interface QuizProps {
  questoes: Questao[]
  tarefa: string
  onRefazer: (tarefa: string) => void
  loading: boolean
}

export default function Quiz({ questoes, tarefa, onRefazer, loading }: QuizProps) {
  if (!questoes || questoes.length === 0) return null

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Quiz Automático
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
      {questoes.map((q, i) => (
        <div key={i} style={{ marginBottom: '1rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
            {i + 1}. {q.pergunta}
          </div>
          {q.alternativas.map((alt, j) => (
            <button
              key={j}
              className="quiz-option"
              onClick={() =>
                alert(j === q.resposta_correta ? 'Correto! ✓' : 'Errado. Tente novamente.')
              }
            >
              {String.fromCharCode(65 + j)}. {alt}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
