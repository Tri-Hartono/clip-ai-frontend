import { ClientProviders } from "@/providers/ClientProviders"
import { Inter } from "next/font/google"
import "@/app/globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata = {
  title: "Clippers AI - Auto Video Clip & Shorts Generator",
  description: "Ubah video panjang YouTube / podcast menjadi Shorts & klip viral berukuran 9:16 portrait lengkap dengan subtitle karaoke estetik otomatis menggunakan kecerdasan buatan Clippers AI.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Modern Emoji Favicon matching the Scissors brand logo in the dashboard */}
        <link rel="icon" href="data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%20100%20100%22%3E%3Ctext%20y=%22.9em%22%20font-size=%2290%22%3E%E2%9C%82%EF%B8%8F%3C/text%3E%3C/svg%3E" />
      </head>
      <body className={`${inter.variable} font-sans bg-slate-50 text-slate-900 min-h-screen antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
