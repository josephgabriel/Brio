import { createContext, useContext, useState, type ReactNode } from "react"
import { getToken, setToken as salvarToken, clearToken } from "@/lib/api-client"

interface AuthContextType {
  isAuthenticated: boolean
  emailVerificado: boolean
  login: (token: string) => void
  logout: () => void
  atualizarEmailVerificado: (valor: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [emailVerificado, setEmailVerificado] = useState(true)

  function login(novoToken: string) {
    salvarToken(novoToken)
    setTokenState(novoToken)
  }

  function logout() {
    clearToken()
    setTokenState(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: token !== null,
        emailVerificado,
        login,
        logout,
        atualizarEmailVerificado: setEmailVerificado,
      }}
    >
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