import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"

import { AuthProvider } from "@/features/auth/auth-context"
import { SessaoAtivaProvider } from "@/features/sessoes/sessao-ativa-context"
import { queryClient } from "@/lib/query-client"
import { router } from "@/routes"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessaoAtivaProvider>
          <RouterProvider router={router} />
        </SessaoAtivaProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)