import { createContext, useContext, useState, type ReactNode } from "react"
import { getToken, setToken as salvarToken, clearToken } from "@/lib/api-client"

interface AuthContextType {
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken())

  function login(novoToken: string) {
    salvarToken(novoToken)
    setTokenState(novoToken)
  }

  function logout() {
    clearToken()
    setTokenState(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: token !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider")
  }
  return context
}