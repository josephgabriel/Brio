import { useEffect, useState } from "react"

type Tema = "light" | "dark"

const CHAVE_TEMA = "brio_theme"

function obterTemaInicial(): Tema {
  const salvo = localStorage.getItem(CHAVE_TEMA) as Tema | null
  if (salvo) return salvo

  const prefereEscuro = window.matchMedia("(prefers-color-scheme: dark)").matches
  return prefereEscuro ? "dark" : "light"
}

export function useTheme() {
  const [tema, setTema] = useState<Tema>(obterTemaInicial)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", tema === "dark")
    localStorage.setItem(CHAVE_TEMA, tema)
  }, [tema])

  function alternarTema() {
    setTema((atual) => (atual === "dark" ? "light" : "dark"))
  }

  return { tema, alternarTema }
}