# features/

Cada subpasta é uma funcionalidade completa do Brio (provas,
dashboard, sessoes, auth). Dentro de cada uma:

- components/  -> componentes visuais específicos da feature
- hooks/       -> hooks React específicos (ex: useProvas)
- api/         -> funções que chamam o backend (ex: provasApi.ts)
- types.ts     -> tipos TypeScript da feature (vamos criar quando
                  come\u00e7armos a Etapa 6, Cadastro de Provas)

Regra: uma feature pode importar de components/ui (design system) e
de lib/ (utilidades), mas features não devem importar diretamente
umas das outras -- isso é sinal de que algo deveria estar em
components/ui ou lib/.
