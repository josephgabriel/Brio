import { createBrowserRouter } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { ProtectedRoute } from "@/features/auth/ProtectedRoute"
import { DashboardPage } from "@/pages/DashboardPage"
import { EstatisticasPage } from "@/pages/EstatisticasPage"
import { LoginPage } from "@/pages/LoginPage"
import { ProvaDetalhePage } from "@/pages/ProvaDetalhePage"
import { ProvaFormPage } from "@/pages/ProvaFormPage"
import { ProvasPage } from "@/pages/ProvaPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { RevisoesPage } from "@/pages/RevisoesPage"
import { SessaoPage } from "@/pages/SessaoPage"
import { ProvaEstatisticasPage } from "@/pages/ProvaEstatisticasPage"
import { TopicoAnotacaoPage } from "@/pages/TopicoAnotacaoPage"
import { EsqueciSenhaPage } from "@/pages/EsqueciSenhaPage"
import { RedefinirSenhaPage } from "@/pages/RedefinirSenhaPage"
import { VerificarEmailPage } from "@/pages/VerificarEmailPage"

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/registro", element: <RegisterPage /> },
  { path: "/verificar-email", element: <VerificarEmailPage /> },
  { path: "/esqueci-senha", element: <EsqueciSenhaPage /> },
  { path: "/redefinir-senha", element: <RedefinirSenhaPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/provas", element: <ProvasPage /> },
          { path: "/provas/nova", element: <ProvaFormPage /> },
          { path: "/provas/:id", element: <ProvaDetalhePage /> },
          { path: "/provas/:id/editar", element: <ProvaFormPage /> },
          { path: "/sessoes", element: <SessaoPage /> },
          { path: "/revisoes", element: <RevisoesPage /> },
          { path: "/estatisticas", element: <EstatisticasPage /> },
          { path: "/provas/:id/estatisticas", element: <ProvaEstatisticasPage /> },
          { path: "/topicos/:id/anotacao", element: <TopicoAnotacaoPage /> },
        ],
      },
    ],
  },
])