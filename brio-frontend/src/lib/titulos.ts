import { matchPath } from "react-router-dom"

export const TITULO_PADRAO = "Brio | Organize seus estudos"

// null = usa o título padrão (é o caso da landing).
// ATENÇÃO À ORDEM: a busca para na primeira que casar. Rotas fixas, como
// "/provas/nova", precisam vir ANTES das dinâmicas, como "/provas/:id".
// Senão "nova" seria lido como se fosse o id de uma prova.
const TITULOS: { path: string; titulo: string | null }[] = [
  { path: "/", titulo: null },
  { path: "/login", titulo: "Entrar" },
  { path: "/registro", titulo: "Criar conta" },
  { path: "/verificar-email", titulo: "Confirmar email" },
  { path: "/esqueci-senha", titulo: "Recuperar senha" },
  { path: "/redefinir-senha", titulo: "Nova senha" },
  { path: "/termos", titulo: "Termos de Uso" },
  { path: "/privacidade", titulo: "Política de Privacidade" },
  { path: "/planos", titulo: "Planos" },
  { path: "/assinatura/retorno", titulo: "Confirmando pagamento" },
  { path: "/conta", titulo: "Minha assinatura" },
  { path: "/dashboard", titulo: "Dashboard" },
  { path: "/calendario", titulo: "Calendário" },
  { path: "/cronograma", titulo: "Cronograma" },
  { path: "/provas", titulo: "Provas" },
  { path: "/provas/nova", titulo: "Nova prova" },
  { path: "/provas/:id", titulo: "Prova" },
  { path: "/provas/:id/editar", titulo: "Editar prova" },
  { path: "/provas/:id/estatisticas", titulo: "Estatísticas da prova" },
  { path: "/sessoes", titulo: "Sessão de estudos" },
  { path: "/revisoes", titulo: "Revisões" },
  { path: "/estatisticas", titulo: "Estatísticas" },
  { path: "/topicos/:id/anotacao", titulo: "Anotações" },
  { path: "/questoes", titulo: "Questões com IA" },
]

export function tituloDaAba(pathname: string): string {
  const rota = TITULOS.find(({ path }) => matchPath(path, pathname))
  if (!rota) return "Página não encontrada | Brio"
  return rota.titulo ? `${rota.titulo} | Brio` : TITULO_PADRAO
}