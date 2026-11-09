'use client'

import { useRef, useState } from 'react'
import { jsPDF } from 'jspdf'
import { toPng } from 'html-to-image'

interface ExportPdfButtonProps {
  containerRef: React.RefObject<HTMLDivElement>
  nivel: string
  niveis: any[]
}

export default function ExportPdfButton({ containerRef, nivel, niveis }: ExportPdfButtonProps) {
  const [gerando, setGerando] = useState(false)

  const exportarPDF = async () => {
    if (!containerRef.current) return

    const node = containerRef.current

    try {
      setGerando(true)

      const dataUrl = await toPng(node, {
        backgroundColor: '#ffffff',
        width: node.offsetWidth,
        height: node.offsetHeight,
        pixelRatio: 1,
      })

      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgProps = pdf.getImageProperties(dataUrl)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save('study-buddy-materiais.pdf')
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      alert('Erro ao gerar PDF. Tente novamente.')
    } finally {
      setGerando(false)
    }
  }

  const nivelLabel = niveis.find((n) => n.value === nivel)?.label || nivel

  return (
    <button
      className="btn-outline"
      onClick={exportarPDF}
      disabled={gerando}
      style={{
        width: 'auto',
        marginTop: '1rem',
        opacity: gerando ? 0.6 : 1,
        cursor: gerando ? 'not-allowed' : 'pointer',
      }}
    >
      {gerando ? 'Gerando PDF...' : '📄 Exportar PDF'}
    </button>
  )
}
