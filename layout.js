export const metadata = {
  title: 'IBENO — Mode & Accessoires · Côte d\'Ivoire',
  description: 'Boutique en ligne de vêtements et accessoires à Abidjan, Côte d\'Ivoire. Paiement Wave, Orange Money, MTN MoMo, Moov Money et Visa.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{margin:0,padding:0,background:'#FAF8F5'}}>{children}</body>
    </html>
  )
}
