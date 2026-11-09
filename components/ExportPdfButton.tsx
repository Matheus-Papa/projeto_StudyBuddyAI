'use client'

import { useRef } from 'react'
import { jsPDF } from 'jspdf'
import htmlToImage from 'html-to-image'

interface ExportPdfButtonProps {
  resultados: any
  nivel: string
  niveis: any[]
}

export default function ExportPdfButton({ resultados, nivel, niveis }: ExportPdfButtonProps) {
  const ref = useRef<HTMLDivElement>(null)

  const exportarPDF = async () => {
    if (!ref.current) return

    const node = ref.current

    try {
      const dataUrl = await htmlToImage.toPng(node, {
        backgroundColor: '#ffffff',
        width: node.offsetWidth,
        height: node.offsetHeight,
        pixelRatio: 2,
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
    }
  }

  const nivelLabel = niveis.find((n) => n.value === nivel)?.label || nivel

  return (
    <button
      className="btn-outline"
      onClick={exportarPDF}
      style={{ width: 'auto', marginTop: '1rem' }}
    >
      📄 Exportar PDF
    </button>
  )
}
