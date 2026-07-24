import { useEffect } from "react"

export function useForceDarkMode() {
  useEffect(() => {
    const root = document.documentElement
    const jaEstavaEscuro = root.classList.contains("dark")

    root.classList.add("dark")

    return () => {
      if (!jaEstavaEscuro) {
        root.classList.remove("dark")
      }
    }
  }, [])
}