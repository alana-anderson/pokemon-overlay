import { Inter } from 'next/font/google'
import "./globals.css"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Pokemon Card Inventory',
  description: 'Manage your Pokemon card collection',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-transparent text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
