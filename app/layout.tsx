import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'VisaLetter.ai — Visa-Ready Cover Letters in 60 Seconds',
  description:
    'AI-powered cover letter generator built for international applicants applying to visa-sponsored jobs in the UK, Canada, and Australia.',
  keywords: 'cover letter generator, visa sponsorship, international applicants, UK jobs, Canada jobs, Australia jobs',
  openGraph: {
    title: 'VisaLetter.ai — Visa-Ready Cover Letters in 60 Seconds',
    description: 'AI cover letters built for international applicants. Paste any job description and get a professional letter in 60 seconds.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.className} bg-[#0A0A14] text-white antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
