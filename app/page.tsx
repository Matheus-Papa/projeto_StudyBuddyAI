'use client'

import { useState, useCallback, useRef } from 'react'
import StudyForm from '@/components/StudyForm'
import TaskSelector from '@/components/TaskSelector'
import ResultCard from '@/components/ResultCard'
import Quiz from '@/components/Quiz'
import Flashcards from '@/components/Flashcards'
import ExportPdfButton from '@/components/ExportPdfButton'

type Modo = 'estudar' | 'selecionar' | 'exibir'

export default function Home() {
  const [modo, setModo] = useState<Modo>('estudar')
  const [texto, setTexto] = useState('')
  const [contexto, setContexto] = useState<string>('')
  const [nivel, setNivel] = useState('ensino_medio')
  const [tarefasSelecionadas, setTarefasSelecionadas] = useState<string[]>([])
  const [resultados, setResultados] = useState<any>(null)
  const [loading, setLoading] = useState(false)
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
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/estudar-contexto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.erro || 'Erro ao estudar contexto')
      }
      const data = await res.json()
      setContexto(data.contexto || '')
      setModo('selecionar')
    } catch (err: any) {
      setError(err.message || 'Erro inesperado. Verifique se o Ollama está rodando.')
    } finally {
      setLoading(false)
    }
  }

  const gerarTarefas = async () => {
    if (tarefasSelecionadas.length === 0) {
      setError('Selecione ao menos uma tarefa.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/gerar-tarefas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contexto, nivel, tarefas: tarefasSelecionadas }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.erro || 'Erro ao gerar materiais')
      }
      const data = await res.json()
      setResultados(data)
      setModo('exibir')
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.')
    } finally {
      setLoading(false)
    }
  }

  const refazerTarefa = async (tarefa: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/gerar-tarefa-unica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contexto, nivel, tarefa }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.erro || 'Erro ao refazer tarefa')
      }
      const data = await res.json()
      setResultados((prev: any) => ({
        ...prev,
        [tarefa]: data[tarefa] || data.resultado || '',
      }))
    } catch (err: any) {
      setError(err.message || 'Erro ao refazer.')
    } finally {
      setLoading(false)
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
        <StudyForm
          texto={texto}
          setTexto={setTexto}
          loading={loading}
          onSubmit={estudarContexto}
          error={error}
          botaoTexto={loading ? 'Estudando...' : 'Estudar contexto'}
        />
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
        </>
      )}

      {modo === 'exibir' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ color: '#0f172a', fontSize: '1.25rem', margin: 0 }}>Materiais gerados</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <ExportPdfButton
                ref={resultadosRef}
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
