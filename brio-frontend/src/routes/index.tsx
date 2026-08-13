import { createBrowserRouter } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import { AssinaturaRoute } from "@/features/assinatura/AssinaturaRoute"
import { ProtectedRoute } from "@/features/auth/ProtectedRoute"
import { AssinaturaRetornoPage } from "@/pages/AssinaturaRetornoPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { EsqueciSenhaPage } from "@/pages/EsqueciSenhaPage"
import { EstatisticasPage } from "@/pages/EstatisticasPage"
import { LandingPage } from "@/pages/LandingPage"
import { LoginPage } from "@/pages/LoginPage"
import { PlanosPage } from "@/pages/PlanosPage"
import { ProvaDetalhePage } from "@/pages/ProvaDetalhePage"
import { ProvaEstatisticasPage } from "@/pages/ProvaEstatisticasPage"
import { ProvaFormPage } from "@/pages/ProvaFormPage"
import { ProvasPage } from "@/pages/ProvaPage"
import { RedefinirSenhaPage } from "@/pages/RedefinirSenhaPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { RevisoesPage } from "@/pages/RevisoesPage"
import { SessaoPage } from "@/pages/SessaoPage"
import { TopicoAnotacaoPage } from "@/pages/TopicoAnotacaoPage"
import { VerificarEmailPage } from "@/pages/VerificarEmailPage"
import { CalendarioPage } from "@/pages/CalendarioPage"

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/registro", element: <RegisterPage /> },
  { path: "/verificar-email", element: <VerificarEmailPage /> },
  { path: "/esqueci-senha", element: <EsqueciSenhaPage /> },
  { path: "/redefinir-senha", element: <RedefinirSenhaPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/planos", element: <PlanosPage /> },
      { path: "/assinatura/retorno", element: <AssinaturaRetornoPage /> },
      {
        element: <AssinaturaRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: "/dashboard", element: <DashboardPage /> },
              { path: "/provas", element: <ProvasPage /> },
              { path: "/provas/nova", element: <ProvaFormPage /> },
              { path: "/provas/:id", element: <ProvaDetalhePage /> },
              { path: "/provas/:id/editar", element: <ProvaFormPage /> },
              { path: "/provas/:id/estatisticas", element: <ProvaEstatisticasPage /> },
              { path: "/sessoes", element: <SessaoPage /> },
              { path: "/revisoes", element: <RevisoesPage /> },
              { path: "/estatisticas", element: <EstatisticasPage /> },
              { path: "/topicos/:id/anotacao", element: <TopicoAnotacaoPage /> },
              { path: "/calendario", element: <CalendarioPage /> },
            ],
          },
        ],
      },
    ],
  },
])