import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"

import { AuthProvider } from "@/features/auth/auth-context"
import { SessaoAtivaProvider } from "@/features/sessoes/sessao-ativa-context"
import { queryClient } from "@/lib/query-client"
import { router } from "@/routes"
import { Toaster } from "@/components/ui/sonner"
import "./index.css"
import { ConfirmacaoProvider } from "@/features/confirmacao/confirmacao-context"
import "@fontsource-variable/geist"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessaoAtivaProvider>
          <ConfirmacaoProvider>
            <RouterProvider router={router} />
            <Toaster />
          </ConfirmacaoProvider>
        </SessaoAtivaProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)