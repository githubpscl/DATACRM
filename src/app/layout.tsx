import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-provider'
import { Toaster } from '@/components/ui/toaster'
import DebugConsole from '@/components/ui/debug-console'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DataCRM - Enterprise CRM & Marketing Automation',
  description: 'AI-powered CRM and Marketing Automation platform with advanced data management capabilities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
            <DebugConsole />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
