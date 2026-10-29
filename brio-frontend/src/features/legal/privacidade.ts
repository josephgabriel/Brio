import {
  DIAS_RESPOSTA_DIREITOS,
  DOCUMENTO,
  EMAIL_CONTATO,
  RESPONSAVEL,
  SITE,
} from "@/features/legal/constantes"
import type { Secao } from "@/features/legal/tipos"

export const RESUMO_PRIVACIDADE =
  "Aqui explicamos quais dados do Brio guardamos, para que servem, com quem passam por necessidade do serviço e como você pode controlá-los."

export const SECOES_PRIVACIDADE: Secao[] = [
  {
    titulo: "Quem somos e o que esta política cobre",
    blocos: [
      `Esta Política explica como o Brio (${SITE}) trata seus dados pessoais, conforme a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018). O controlador dos dados é ${RESPONSAVEL} (${DOCUMENTO}).`,
      `Para qualquer assunto de privacidade, escreva para ${EMAIL_CONTATO}.`,
    ],
  },
  {
    titulo: "Quais dados coletamos",
    blocos: [
      [
        "Dados da conta: nome, email e senha (protegida por hash, nunca guardada em texto puro)e a data e a versão dos Termos que você aceitou no cadastro.",
        "Dados que você cria ao estudar: provas, matérias, conteúdos, sessões de estudo (com data e duração), revisões, eventos do calendário, itens do cronograma e anotações (texto e imagens).",
        "Dados do recurso de IA: o nome do PDF enviado, as questões geradas, as suas respostas e os diagnósticos de desempenho.",
        "Dados da assinatura: plano, status, datas, valores e identificadores dos pagamentos. Os dados do seu cartão são digitados no ambiente do Mercado Pago e não chegam ao Brio.",
        "Dados de uso: registros de eventos como cadastro, login, início e fim de sessão e criação de provas, para entendermos e melhorarmos o produto.",
        "Dados técnicos: registros de acesso dos servidores, como endereço IP e data e hora, mantidos pela hospedagem para segurança e diagnóstico de falhas.",
      ],
    ],
  },
  {
    titulo: "Para que usamos seus dados",
    blocos: [
      [
        "criar e manter sua conta e prestar o serviço contratado;",
        "processar pagamentos, renovações e reembolsos;",
        "enviar os emails do serviço, como confirmação de email e recuperação de senha;",
        "calcular suas estatísticas e agendar suas revisões;",
        "gerar questões e diagnósticos quando você usa o recurso de IA;",
        "garantir a segurança, prevenir fraudes e abusos e cumprir obrigações legais;",
        "entender como o produto é usado e melhorá-lo, de forma agregada.",
      ],
      "Nossas bases legais são, principalmente, a execução do contrato com você, o cumprimento de obrigações legais e, em alguns casos, nosso legítimo interesse (como segurança e melhoria do produto). Não vendemos seus dados e não os usamos para publicidade de terceiros.",
    ],
  },
  {
    titulo: "Com quem compartilhamos",
    blocos: [
      "Usamos fornecedores para operar o Brio. Cada um recebe só o necessário para a sua função:",
      [
        "Mercado Pago: pagamentos e assinaturas.",
        "Neon: banco de dados onde seus dados ficam armazenados.",
        "Render: servidores que executam o aplicativo.",
        "Vercel: hospedagem do site, a parte que você vê no navegador.",
        "Resend: envio dos emails do serviço.",
        "Cloudinary: armazenamento das imagens que você insere nas anotações.",
        "Google (Gemini): geração de questões e diagnósticos no recurso de IA.",
      ],
      "Também podemos compartilhar dados quando a lei ou uma autoridade exigir.",
    ],
  },
  {
    titulo: "Inteligência artificial e seus PDFs",
    blocos: [
      "Quando você usa Questões IA, o Brio extrai o texto do seu PDF (apenas o trecho inicial, até um limite de tamanho) e o envia à API do Google Gemini para criar as questões. Para o diagnóstico de desempenho, enviamos um resumo dos seus acertos e erros, com trechos dos enunciados das questões que você errou.",
      "O arquivo PDF em si não fica armazenado no Brio: guardamos o nome do arquivo, as questões geradas e o seu histórico de respostas.",
      "O tratamento pelo Google segue os termos da API do Gemini. Por isso, não envie documentos sigilosos nem com dados pessoais de terceiros.",
      "As imagens que você insere nas anotações ficam hospedadas no Cloudinary e podem ser abertas por quem tiver o endereço delas.",
    ],
  },
  {
    titulo: "Dados guardados no seu navegador",
    blocos: [
      "O Brio guarda no armazenamento do seu navegador (localStorage), no seu dispositivo:",
      [
        "a sua sessão de login;",
        "a preferência de tema (claro ou escuro);",
        "o andamento de uma sessão de estudo em curso, para ela não se perder se você recarregar a página;",
        "rascunhos das anotações, que protegem o seu texto caso o salvamento falhe.",
      ],
      "Esses dados são necessários ao funcionamento do aplicativo. Não usamos cookies de publicidade nem rastreadores de terceiros.",
    ],
  },
  {
    titulo: "Por quanto tempo guardamos",
    blocos: [
      "Mantemos seus dados enquanto a sua conta existir. Se você pedir a exclusão, apagamos ou anonimizamos os dados, exceto o que a lei exigir que guardemos, como registros de pagamento.",
      "Cópias de segurança do banco de dados podem conservar dados já apagados por um período limitado, até serem descartadas.",
    ],
  },
  {
    titulo: "Seus direitos",
    blocos: [
      "A LGPD garante a você, entre outros, os direitos de:",
      [
        "confirmar se tratamos seus dados e acessá-los;",
        "corrigir dados incompletos ou desatualizados;",
        "pedir a anonimização, o bloqueio ou a eliminação de dados desnecessários ou tratados em desacordo com a lei;",
        "pedir a portabilidade dos seus dados;",
        "saber com quem compartilhamos seus dados;",
        "revogar um consentimento que tenha dado;",
        "reclamar à Autoridade Nacional de Proteção de Dados (ANPD).",
      ],
      `Para exercer qualquer um deles, escreva para ${EMAIL_CONTATO}. Respondemos em até ${DIAS_RESPOSTA_DIREITOS} dias. Por enquanto, a exclusão da conta e a exportação completa dos seus dados são feitas a pedido, por email.`,
    ],
  },
  {
    titulo: "Segurança",
    blocos: [
      "Adotamos medidas como conexão criptografada (HTTPS), senhas protegidas por hash e controle para que cada pessoa acesse apenas os próprios dados. Nenhum sistema é totalmente seguro: se houver um incidente que possa afetar você de forma relevante, avisaremos você e a ANPD, conforme a lei.",
    ],
  },
  {
    titulo: "Crianças e adolescentes",
    blocos: [
      "O Brio pode ser usado por estudantes menores de 18 anos, e tratamos os dados de adolescentes com atenção ao seu melhor interesse. A contratação de um plano exige autorização de um responsável legal. O Brio não é destinado a crianças menores de 12 anos.",
      `Pais e responsáveis podem escrever para ${EMAIL_CONTATO} para pedir informações ou a exclusão dos dados.`,
    ],
  },
  {
    titulo: "Transferência internacional de dados",
    blocos: [
      "Alguns fornecedores, como Google, Resend, Cloudinary e Render, podem tratar dados em servidores fora do Brasil. Nesses casos, o tratamento observa a LGPD e os termos de cada fornecedor.",
    ],
  },
  {
    titulo: "Alterações desta política",
    blocos: [
      "Podemos atualizar esta Política. Mudanças relevantes serão comunicadas por email ou no aplicativo, e a versão em vigor aparece no topo desta página.",
    ],
  },
]