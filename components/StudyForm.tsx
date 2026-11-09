interface StudyFormProps {
  texto: string
  setTexto: (v: string) => void
  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  error: string | null
  botaoTexto?: string
}

export default function StudyForm({
  texto,
  setTexto,
  loading,
  onSubmit,
  error,
  botaoTexto = 'Estudar contexto',
}: StudyFormProps) {
  return (
    <form className="card" onSubmit={onSubmit}>
      {error && <div className="error">{error}</div>}
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
        Cole o texto aqui:
      </label>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Cole um texto complexo para o Ollama estudar..."
      />
      <button type="submit" disabled={loading} style={{ marginTop: '1.5rem' }}>
        {botaoTexto}
      </button>
    </form>
  )
}
