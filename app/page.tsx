'use client'

import { useState, useCallback, useRef } from 'react'
import StudyForm from '@/components/StudyForm'
import TaskSelector from '@/components/TaskSelector'
import ResultCard from '@/components/ResultCard'
import Quiz from '@/components/Quiz'
import Flashcards from '@/components/Flashcards'
import ExportPdfButton from '@/components/ExportPdfButton'
import ProgressBar from '@/components/ProgressBar'
import { postJson } from '@/lib/api-client'

type Modo = 'estudar' | 'selecionar' | 'exibir'
type Status = 'idle' | 'estudando' | 'gerando'

export default function Home() {
  const [modo, setModo] = useState<Modo>('estudar')
  const [texto, setTexto] = useState('')
  const [contexto, setContexto] = useState<string>('')
  const [nivel, setNivel] = useState('ensino_medio')
  const [tarefasSelecionadas, setTarefasSelecionadas] = useState<string[]>([])
  const [resultados, setResultados] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const resultadosRef = useRef<HTMLDivElement>(null)

  const niveis = [
    { value: 'ensino_fundamental_i', label: 'Ensino Fundamental I' },
    { value: 'ensino_fundamental_ii', label: 'Ensino Fundamental II' },
    { value: 'ensino_medio', label: 'Ensino Médio' },
    { value: 'superior', label: 'Superior' },
  ]

  const todasTarefas = [
    { value: 'resumo', label: 'Resumo' },
    { value: 'explicacao', label: 'Explicação por nível' },
    { value: 'quiz', label: 'Quiz automático' },
    { value: 'flashcards', label: 'Flashcards' },
  ]

  const estudarContexto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!texto.trim()) {
      setError('Cole um texto antes de estudar.')
      return
    }
    setStatus('estudando')
    setProgresso(30)
    setLoading(true)
    setError(null)
    try {
      const payload = await postJson('/api/estudar-contexto', { texto })
      setProgresso(100)
      if (payload?.contexto) {
        setContexto(payload.contexto)
        setModo('selecionar')
      }
    } catch (err: any) {
      if (!error) setError(err.message || 'Erro inesperado ao estudar o contexto.')
    } finally {
      setProgresso(0)
      setLoading(false)
      setStatus('idle')
    }
  }

  const gerarTarefas = async () => {
    if (tarefasSelecionadas.length === 0) {
      setError('Selecione ao menos uma tarefa.')
      return
    }
    setStatus('gerando')
    setProgresso(30)
    setLoading(true)
    setError(null)
    try {
      const payload = await postJson('/api/gerar-tarefas', {
        contexto,
        nivel,
        tarefas: tarefasSelecionadas,
      })
      setProgresso(100)
      setResultados(payload || null)
      setModo('exibir')
    } catch (err: any) {
      if (!error) setError(err.message || 'Erro inesperado ao gerar as tarefas.')
    } finally {
      setProgresso(0)
      setLoading(false)
      setStatus('idle')
    }
  }

  const refazerTarefa = async (tarefa: string) => {
    setStatus('gerando')
    setProgresso(30)
    setLoading(true)
    setError(null)
    try {
      const payload = await postJson('/api/gerar-tarefa-unica', {
        contexto,
        nivel,
        tarefa,
      })
      setProgresso(100)
      setResultados((prev: any) => ({
        ...prev,
        [tarefa]: payload?.[tarefa] || '',
      }))
    } catch (err: any) {
      if (!error) setError(err.message || 'Erro ao refazer.')
    } finally {
      setProgresso(0)
      setLoading(false)
      setStatus('idle')
    }
  }

  const voltarParaSelecao = () => {
    setModo('selecionar')
    setError(null)
  }

  return (
    <div className="container">
      <h1>Study Buddy AI</h1>
      <p className="subtitle">
        Estude o texto primeiro, depois escolha o que gerar. Tudo local com Ollama.
      </p>

      {modo === 'estudar' && (
        <>
          <StudyForm
            texto={texto}
            setTexto={setTexto}
            loading={loading}
            onSubmit={estudarContexto}
            error={error}
            botaoTexto={loading ? 'Estudando...' : 'Estudar contexto'}
          />
          <ProgressBar progress={progresso} status={status} />
        </>
      )}

      {modo === 'selecionar' && (
        <>
          <div className="card">
            <h2 style={{ marginBottom: '1rem', color: '#0f172a' }}>
              Texto estudado ✓
            </h2>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.95rem', color: '#475569' }}>
              {contexto}
            </div>
          </div>

          <TaskSelector
            nivel={nivel}
            setNivel={setNivel}
            niveis={niveis}
            tarefas={todasTarefas}
            selecionadas={tarefasSelecionadas}
            setSelecionadas={setTarefasSelecionadas}
            loading={loading}
            onGerar={gerarTarefas}
            error={error}
            contextoEstudado={!!contexto}
          />
          <ProgressBar progress={progresso} status={status} />
        </>
      )}

      {modo === 'exibir' && (
        <>
          <ProgressBar progress={progresso} status={status} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ color: '#0f172a', fontSize: '1.25rem', margin: 0 }}>Materiais gerados</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <ExportPdfButton
                containerRef={resultadosRef}
                nivel={nivel}
                niveis={niveis}
              />
              <button onClick={voltarParaSelecao} className="btn-ghost no-print">
                Escolher mais tarefas
              </button>
            </div>
          </div>

          <div ref={resultadosRef} className="result-grid no-print">
            {resultados.resumo && (
              <ResultCard
                titulo="Resumo"
                conteudo={resultados.resumo}
                tarefa="resumo"
                onRefazer={refazerTarefa}
                loading={loading}
              />
            )}
            {resultados.explicacao && (
              <ResultCard
                titulo={`Explicação (${niveis.find(n => n.value === nivel)?.label})`}
                conteudo={resultados.explicacao}
                tarefa="explicacao"
                onRefazer={refazerTarefa}
                loading={loading}
              />
            )}
            {resultados.quiz && resultados.quiz.length > 0 && (
              <Quiz
                questoes={resultados.quiz}
                tarefa="quiz"
                onRefazer={refazerTarefa}
                loading={loading}
              />
            )}
            {resultados.flashcards && resultados.flashcards.length > 0 && (
              <Flashcards
                cards={resultados.flashcards}
                tarefa="flashcards"
                onRefazer={refazerTarefa}
                loading={loading}
              />
            )}
          </div>

          {error && <div className="error">{error}</div>}
        </>
      )}
    </div>
  )
}
