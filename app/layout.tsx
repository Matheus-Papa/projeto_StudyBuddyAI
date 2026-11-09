import './globals.css'

export const metadata = {
  title: 'Study Buddy AI',
  description: 'Assistente de estudos com IA: resumo, explicação por nível, quiz e flashcards',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
