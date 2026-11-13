# Redesign das páginas do Brio

## Como aplicar
1. Substitua os arquivos de `paginas/` na sua pasta de páginas.
2. Copie `novos/src/` para dentro do seu `src/`, mantendo as pastas. São arquivos novos:
   - `components/shared/`: HeroPagina (e PainelHero), Abas, TelaStatus, CartaoProva, CartaoPlano
   - `components/auth/`: AuthLayout (e AvisoAuth), CampoSenha, RequisitosSenha
   - `features/auth/senha.ts`, `features/provas/apresentacao.ts`, `features/assinatura/beneficios.ts`
3. Rode `tsc` / `npm run build`. Não consegui compilar aqui (não tenho o projeto): conferi só a sintaxe e os imports.

Termos e Privacidade não mudaram (são só wrappers).

## Identidade mantida
Tema escuro, esmeralda, GRADIENTE_HERO nos banners, cards arredondados, lucide, textos em português.
Só usei tokens e classes que o seu código já usava. Nenhuma chamada de API, rota, query key ou regra de negócio mudou.

## O que mudou
**Compartilhado (menos código repetido)**
- Banner das 7 telas internas virou `HeroPagina`/`PainelHero`. Os círculos e o gradiente continuam; sumiram o rótulo em CAIXA ALTA e o blur.
- Abas em pílula viraram `Abas`, agora com anel de foco no teclado.
- Layout dividido do login/cadastro/recuperar/redefinir virou `AuthLayout`; campo de senha e requisitos viraram componentes.
- Card de prova (Dashboard e Provas) virou `CartaoProva`.

**Landing**: hero alinhado à esquerda com prévia de uma sessão e a linha das revisões (1, 7, 16, 35 dias, espaçadas na proporção real). Recursos em lista (sem cards 01–06 numerados), links de navegação no topo, planos com a lista de benefícios uma vez só. *Troquei o título do hero* ("O sistema operacional da sua aprovação" era um clichê genérico); se preferir o antigo, é só voltar o texto.

**UX**
- Login mostra o aviso "Senha redefinida!" (a tela de redefinição já mandava, ninguém exibia).
- Redefinir senha avisa na hora se o link não tem token e oferece "Pedir um novo link".
- Recuperar senha: confirmação com o e-mail digitado e "Usar outro e-mail".
- Planos: botão de assinar visível sem rolar; "Sair da conta" no topo.
- Minha assinatura: corrigido `<Button><Link/></Button>` (interativo dentro de interativo); mostra até quando dá para pedir reembolso.
- Dashboard: botões no topo, contagem de revisões no botão, prioridade com acento ("Média", antes "media"), contagem regressiva em destaque (âmbar na última semana).
- Provas: ativas primeiro, arquivadas/concluídas em seção própria.
- Formulário de prova: seções, texto explicando a meta semanal, "Excluir" separado do "Salvar", botão Cancelar.
- Sessão: título visível, cronômetro fixo ao rolar no desktop, "Retomar" em destaque, Pomodoro recolhido com resumo (editável em "Alterar").
- Anotação: cabeçalho que quebra linha no celular, largura de leitura, erro com "Tentar de novo".
- Telas de erro/404/verificar e-mail/aguardando pagamento com ícone, texto de próximo passo e botões.

## Para você decidir
- Abas ativas usam `bg-emerald-500 text-white` (como antes). Esse branco sobre esmeralda-500 tem contraste baixo (~2,5:1); `emerald-700` resolveria, mas muda o tom, então deixei.
- Questões agora usa `CartaoCota` (o mesmo de Resumos) em vez do painel copiado. Confira se o texto "Restam N gerações" ficou igual.
- Labels de "Email" viraram "E-mail" nas telas de auth.
