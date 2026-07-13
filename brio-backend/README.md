# Brio — Backend

API do Brio, construída com FastAPI seguindo Clean Architecture
simplificada.

## Estrutura

- `app/domain` — regras de negócio puras (sem dependências externas)
- `app/application` — casos de uso, orquestram o domínio
- `app/infrastructure` — banco de dados, configuração, detalhes técnicos
- `app/interface/api` — routers FastAPI e schemas Pydantic

Ver documento de arquitetura completo para detalhes de cada camada.

Este projeto está na **Etapa 1** do roadmap: apenas a estrutura de
pastas foi criada. A configuração real do FastAPI acontece na
Etapa 2.
