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
  setSelecionadas: (v: string[]) => void
  loading: boolean
  onGerar: () => void
  error: string | null
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
}: TaskSelectorProps) {
  const toggleTarefa = (value: string) => {
    setSelecionadas(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  return (
    <form className="card" onSubmit={(e) => { e.preventDefault(); onGerar() }}>
      {error && <div className="error">{error}</div>}

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
                color: '#334155',
              }}
            >
              <input
                type="checkbox"
                checked={selecionadas.includes(t.value)}
                onChange={() => toggleTarefa(t.value)}
                disabled={loading}
                style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
              />
              {t.label}
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
                border: `2px solid ${nivel === n.value ? '#2563eb' : '#e2e8f0'}`,
                borderRadius: '10px',
                background: nivel === n.value ? '#2563eb' : '#ffffff',
                color: nivel === n.value ? '#ffffff' : '#334155',
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
