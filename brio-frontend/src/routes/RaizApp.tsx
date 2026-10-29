import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"

import { tituloDaAba } from "@/lib/titulos"

export function RaizApp() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = tituloDaAba(pathname)
  }, [pathname])

  return <Outlet />
}