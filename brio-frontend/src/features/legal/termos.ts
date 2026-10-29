import {
  DIAS_AVISO_MUDANCA_PRECO,
  DIAS_GARANTIA,
  DOCUMENTO,
  EMAIL_CONTATO,
  LIMITE_MENSAL_IA,
  PRECO_ANUAL,
  PRECO_MENSAL,
  RESPONSAVEL,
  SITE,
} from "@/features/legal/constantes"
import type { Secao } from "@/features/legal/tipos"

export const RESUMO_TERMOS =
  "Estas regras explicam como o Brio funciona, o que você pode esperar de nós e o que esperamos de você. É curto e está em linguagem direta."

export const SECOES_TERMOS: Secao[] = [
  {
    titulo: "Quem somos e o que você aceita",
    blocos: [
      `O Brio (${SITE}) é uma plataforma de organização de estudos para quem se prepara para o ENEM, vestibulares e concursos públicos. Ele é operado por ${RESPONSAVEL}, inscrito(a) sob o documento ${DOCUMENTO}.`,
      "Ao criar uma conta ou contratar um plano, você declara que leu e concorda com estes Termos de Uso e com a Política de Privacidade. Se não concordar, não use o serviço.",
    ],
  },
  {
    titulo: "O que o Brio oferece",
    blocos: [
      "O Brio reúne, em um só lugar:",
      [
        "cadastro de provas, matérias e conteúdos;",
        "sessões de estudo com cronômetro Pomodoro;",
        "revisões espaçadas agendadas automaticamente;",
        "anotações com texto formatado e imagens, e exportação em PDF;",
        "calendário e cronograma semanal;",
        "estatísticas e Índice de Preparação;",
        "geração de questões com inteligência artificial a partir de PDFs.",
      ],
      "O Brio é uma ferramenta de organização e apoio. Não garantimos aprovação em nenhuma prova nem resultados de aprendizagem. O Índice de Preparação mede a consistência do seu ritmo em relação à meta que você mesmo definiu e não é uma previsão de aprovação.",
    ],
  },
  {
    titulo: "Conta e elegibilidade",
    blocos: [
      "Informe dados verdadeiros e um email que você controle, e confirme esse email quando solicitado.",
      "Para contratar um plano pago é preciso ter 18 anos completos. Se você tem menos de 18 anos, a contratação deve ser feita ou autorizada por um responsável legal.",
      "Você é responsável por guardar sua senha e por tudo o que acontece na sua conta. A conta é pessoal e não deve ser compartilhada. Avise-nos imediatamente se suspeitar de acesso indevido.",
    ],
  },
  {
    titulo: "Planos, pagamento e renovação",
    blocos: [
      [
        `Plano mensal: ${PRECO_MENSAL} por mês.`,
        `Plano anual: ${PRECO_ANUAL} por ano.`,
      ],
      "O pagamento é processado pelo Mercado Pago, em cobrança recorrente. A assinatura renova automaticamente ao fim de cada período, mensal ou anual, até você desativar a renovação.",
      "O acesso às áreas do aplicativo depende de uma assinatura ativa. Quando ela termina ou é cancelada, o acesso fica bloqueado até uma nova contratação.",
      `Se mudarmos os preços, avisaremos por email com pelo menos ${DIAS_AVISO_MUDANCA_PRECO} dias de antecedência, e o novo valor só vale a partir da próxima renovação.`,
    ],
  },
  {
    titulo: "Cancelamento e garantia de reembolso",
    blocos: [
      `Garantia de ${DIAS_GARANTIA} dias: você pode pedir o reembolso total em até ${DIAS_GARANTIA} dias após a contratação, pela tela “Minha assinatura”. Ao reembolsar, o acesso é encerrado, e o valor volta pelo mesmo meio de pagamento, no prazo que o Mercado Pago e a operadora do seu cartão levarem. Essa garantia está alinhada ao direito de arrependimento previsto no Código de Defesa do Consumidor para compras pela internet.`,
      "Cancelar a renovação: você pode desativar a renovação automática a qualquer momento, também em “Minha assinatura”. Você continua com acesso até o fim do período já pago e não será cobrado de novo. Passado o prazo de garantia, o cancelamento não gera reembolso do período em curso.",
    ],
  },
  {
    titulo: "Uso aceitável",
    blocos: [
      "Não é permitido:",
      [
        "tentar acessar contas ou dados de outras pessoas;",
        "burlar limites do serviço, como a cota mensal de IA, ou os controles de pagamento e de acesso;",
        "usar robôs ou automações para extrair conteúdo ou sobrecarregar o serviço;",
        "enviar conteúdo ilegal, que viole direitos de terceiros ou que contenha vírus;",
        "revender ou compartilhar o seu acesso.",
      ],
      "Podemos suspender contas que violem estas regras.",
    ],
  },
  {
    titulo: "Seu conteúdo",
    blocos: [
      "As anotações, provas, matérias e demais conteúdos que você cria continuam sendo seus. Você nos autoriza apenas a armazená-los e processá-los para prestar o serviço a você, inclusive para gerar o PDF exportado e as questões que você pedir.",
      "Você declara ter o direito de usar os materiais que insere ou envia, como PDFs e imagens. Não envie material protegido por direitos autorais de terceiros sem permissão, nem documentos sigilosos ou com dados pessoais de outras pessoas.",
    ],
  },
  {
    titulo: "Questões geradas por inteligência artificial",
    blocos: [
      "O recurso Questões IA cria perguntas de múltipla escolha a partir do texto dos PDFs que você envia, usando um modelo de inteligência artificial de terceiros.",
      "As questões, os gabaritos e as explicações podem conter erros ou imprecisões. Confira sempre com o seu material oficial e não use o recurso como única fonte de estudo.",
      `Há um limite mensal de gerações por conta (atualmente ${LIMITE_MENSAL_IA}), que pode mudar. Os detalhes de como o texto do seu PDF é tratado estão na Política de Privacidade.`,
    ],
  },
  {
    titulo: "Disponibilidade e mudanças no serviço",
    blocos: [
      "Trabalhamos para manter o Brio disponível, mas não garantimos funcionamento ininterrupto. Podem ocorrer manutenções, instabilidades de fornecedores e lentidão ocasional.",
      "Podemos melhorar, alterar ou descontinuar funcionalidades, e faremos o possível para avisar com antecedência quando a mudança for relevante. Você pode exportar suas anotações em PDF a qualquer momento.",
    ],
  },
  {
    titulo: "Limitação de responsabilidade",
    blocos: [
      "Dentro do que a lei permite, o Brio não responde por prejuízos indiretos, como o resultado de provas, perda de oportunidades ou decisões tomadas com base nas estatísticas, no Índice de Preparação ou nas questões geradas por IA.",
      "Nada nestes Termos limita direitos que a lei do consumidor garante a você.",
    ],
  },
  {
    titulo: "Suspensão e encerramento",
    blocos: [
      "Podemos suspender ou encerrar contas que violem estes Termos, com aviso quando possível. Você pode parar de usar o Brio quando quiser. Para pedir a exclusão dos seus dados, siga o que está descrito na Política de Privacidade.",
    ],
  },
  {
    titulo: "Alterações destes Termos",
    blocos: [
      "Podemos atualizar estes Termos. Quando a mudança for relevante, avisaremos por email ou no aplicativo, e a versão em vigor aparece no topo desta página. Se você continuar usando o Brio depois do aviso, entendemos que concorda com a nova versão. Se não concordar, pode cancelar.",
    ],
  },
  {
    titulo: "Lei aplicável e contato",
    blocos: [
      "Estes Termos seguem a lei brasileira. Fica garantido a você, como consumidor, o direito de propor ações no foro do seu domicílio.",
      `Dúvidas, pedidos ou reclamações: ${EMAIL_CONTATO}.`,
    ],
  },
]