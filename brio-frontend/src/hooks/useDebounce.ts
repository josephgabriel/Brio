import { useRef } from "react"

export function useDebounce<T extends (...args: never[]) => void>(
  callback: T,
  delayMs: number,
) {
  const idTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  return (...args: Parameters<T>) => {
    if (idTimer.current) clearTimeout(idTimer.current)
    idTimer.current = setTimeout(() => callback(...args), delayMs)
  }
}