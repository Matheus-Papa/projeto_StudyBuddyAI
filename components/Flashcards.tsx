'use client'

import { useState } from 'react'

interface Flashcard {
  pergunta: string
  resposta: string
}

interface FlashcardsProps {
  cards: Flashcard[]
  tarefa: string
  onRefazer: (tarefa: string) => void
  loading: boolean
}

export default function Flashcards({ cards, tarefa, onRefazer, loading }: FlashcardsProps) {
  if (!cards || cards.length === 0) return null

  const [showAnswers, setShowAnswers] = useState<boolean[]>(cards.map(() => false))

  const gerarMais = async () => {
    await onRefazer(tarefa)
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Flashcards para Revisão
        </h2>
        <button
          onClick={gerarMais}
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
          Gerar mais
        </button>
      </div>
      {cards.map((card, i) => (
        <div
          key={i}
          className="flashcard"
          onClick={() => {
            const next = [...showAnswers]
            next[i] = !next[i]
            setShowAnswers(next)
          }}
        >
          <div className="pergunta">{card.pergunta}</div>
          {showAnswers[i] ? (
            <div className="answer">{card.resposta}</div>
          ) : (
            <div className="flashcard-footer">Clique para ver a resposta</div>
          )}
        </div>
      ))}
    </div>
  )
}
