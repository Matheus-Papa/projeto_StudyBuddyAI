interface TarefaOption {
  value: string
  label: string
}

interface NivelOption {
  value: string
  label: string
}

interface TaskSelectorProps {
  nivel: string
  setNivel: (v: string) => void
  niveis: NivelOption[]
  tarefas: TarefaOption[]
  selecionadas: string[]
  setSelecionadas: (v: string[] | ((prev: string[]) => string[])) => void
  loading: boolean
  onGerar: () => void
  error: string | null
  contextoEstudado?: boolean
}

export default function TaskSelector({
  nivel,
  setNivel,
  niveis,
  tarefas,
  selecionadas,
  setSelecionadas,
  loading,
  onGerar,
  error,
  contextoEstudado,
}: TaskSelectorProps) {
  const toggleTarefa = (value: string) => {
    setSelecionadas((prev: string[]) =>
      prev.includes(value) ? prev.filter((v: string) => v !== value) : [...prev, value]
    )
  }

  return (
    <form className="card" onSubmit={(e) => { e.preventDefault(); onGerar() }}>
      {error && <div className="error">{error}</div>}

      {contextoEstudado && (
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          fontSize: '0.9rem',
          color: '#1e40af',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span>📚</span>
          <span>Contexto já estudado — materiais serão gerados usando o texto anterior.</span>
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>
          O que você quer gerar? (pode escolher mais de uma)
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tarefas.map(t => (
            <label
              key={t.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                color: 'var(--text-secondary)',
              }}
            >
              <input
                type="checkbox"
                checked={selecionadas.includes(t.value)}
                onChange={() => toggleTarefa(t.value)}
                disabled={loading}
                style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
              />
              <span style={{ color: 'var(--text)', fontWeight: 500 }}>{t.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600 }}>
          Nível de complexidade:
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {niveis.map(n => (
            <button
              key={n.value}
              type="button"
              onClick={() => setNivel(n.value)}
              disabled={loading}
              style={{
                padding: '0.75rem 1rem',
                border: `2px solid ${nivel === n.value ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '10px',
                background: nivel === n.value ? 'var(--accent)' : 'var(--card-bg)',
                color: nivel === n.value ? '#ffffff' : 'var(--text)',
                fontWeight: 600,
                fontSize: '0.9375rem',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" disabled={loading || selecionadas.length === 0} style={{ width: '100%' }}>
        {loading ? 'Gerando...' : 'Gerar materiais selecionados'}
      </button>
    </form>
  )
}
