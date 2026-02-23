import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

export const metadata: Metadata = {
  title: "WhatsApp AI Bot — Admin Dashboard",
  description:
    "AI-powered WhatsApp chatbot with admin dashboard for managing conversations, customers, and bot settings.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#10b981",
          colorBackground: "#18181b",
          colorText: "#fafafa",
          colorInputBackground: "#27272a",
          colorInputText: "#fafafa",
        },
        elements: {
          card: "bg-zinc-900 border border-zinc-800 shadow-2xl",
          modalBackdrop: "backdrop-blur-sm bg-black/60",
        },
      }}
    >
      <html lang="en" className="dark">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="antialiased font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
