import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"

import { AuthLayout } from "@/components/auth/AuthLayout"
import { CampoSenha } from "@/components/auth/CampoSenha"
import { RequisitosSenha } from "@/components/auth/RequisitosSenha"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { avaliarSenha } from "@/features/auth/senha"
import { VERSAO_TERMOS } from "@/features/legal/constantes"

const API_URL = import.meta.env.VITE_API_URL as string

const MSG_SEM_CONEXAO = "Sem conexão com o servidor. Verifique sua internet e tente novamente."

async function chamarApi(url: string, opcoes: RequestInit): Promise<Response> {
  try {
    return await fetch(url, opcoes)
  } catch {
    throw new Error(MSG_SEM_CONEXAO)
  }
}

function mensagemDaResposta(erro: unknown, padrao: string): string {
  const detalhe = (erro as { detail?: unknown } | null)?.detail
  return typeof detalhe === "string" ? detalhe : padrao
}

async function registrarUsuario(nome: string, email: string, senha: string): Promise<void> {
  const response = await chamarApi(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      email,
      senha,
      aceitou_termos: true,
      termos_versao: VERSAO_TERMOS,
    }),
  })

  if (!response.ok) {
    const erro = await response.json().catch(() => null)
    throw new Error(
      mensagemDaResposta(erro, "Não foi possível criar a conta. Confira os dados e tente novamente."),
    )
  }
}

export function RegisterPage() {
  const [aceitouTermos, setAceitouTermos] = useState(false)
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [erroFormulario, setErroFormulario] = useState<string | null>(null)

  const navigate = useNavigate()

  const senhaEhValida = avaliarSenha(senha).valida
  const senhasCoincidem = senha === confirmarSenha && confirmarSenha.length > 0

  const mutation = useMutation({
    mutationFn: () => registrarUsuario(nome.trim(), email, senha),
    onSuccess: () => {
      navigate("/login", {
        state: {
          registradoComSucesso: true,
          emailCadastrado: email,
        },
      })
    },
  })

  function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!aceitouTermos) return
    setErroFormulario(null)

    if (!senhaEhValida) {
      setErroFormulario("A senha não atende a todos os requisitos de segurança.")
      return
    }

    if (senha !== confirmarSenha) {
      setErroFormulario("As senhas não coincidem.")
      return
    }

    mutation.mutate()
  }

  return (
    <AuthLayout titulo="Criar conta" descricao="Cadastre-se para começar seus estudos.">
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <Label htmlFor="nome">Nome completo</Label>
            <Input
              id="nome"
              type="text"
              autoComplete="name"
              autoCapitalize="words"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-2 h-11 text-base md:text-sm"
              placeholder="Seu nome"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 h-11 text-base md:text-sm"
              placeholder="seu@email.com"
              required
            />
          </div>

          <CampoSenha
            id="senha"
            rotulo="Criar senha"
            value={senha}
            onChange={setSenha}
            autoComplete="new-password"
          >
            <RequisitosSenha senha={senha} />
          </CampoSenha>

          <CampoSenha
            id="confirmarSenha"
            rotulo="Confirmar senha"
            nomeAcessivel="confirmação de senha"
            value={confirmarSenha}
            onChange={setConfirmarSenha}
            autoComplete="new-password"
          >
            {confirmarSenha.length > 0 && !senhasCoincidem && (
              <p className="mt-1.5 text-xs text-destructive">As senhas não coincidem.</p>
            )}
          </CampoSenha>

          {/* Termos de Uso e Política */}
          <div className="flex items-start gap-3 pt-2">
            <input
              id="aceite-termos"
              type="checkbox"
              checked={aceitouTermos}
              onChange={(e) => setAceitouTermos(e.target.checked)}
              required
              className="mt-0.5 size-5 shrink-0 cursor-pointer accent-primary sm:mt-1 sm:size-4"
            />
            <label
              htmlFor="aceite-termos"
              className="cursor-pointer select-none text-sm font-normal leading-snug text-muted-foreground"
            >
              Li e aceito os{" "}
              <Link
                to="/termos"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline hover:text-foreground"
              >
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link
                to="/privacidade"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline hover:text-foreground"
              >
                Política de Privacidade
              </Link>
              .
            </label>
          </div>
        </div>

        {(erroFormulario || mutation.isError) && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {erroFormulario ?? mutation.error?.message}
          </p>
        )}

        <Button
          type="submit"
          className="mt-6 h-12 w-full sm:h-11"
          disabled={!aceitouTermos || mutation.isPending || !senhaEhValida || !senhasCoincidem}
        >
          {mutation.isPending ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já possui uma conta?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}
