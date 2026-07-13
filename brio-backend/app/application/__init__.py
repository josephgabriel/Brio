"""
Camada de APLICAÇÃO (casos de uso / use cases).

Cada caso de uso representa UMA ação do sistema, com nome de verbo:
CriarProva, IniciarSessaoDeEstudo, RegistrarRevisao.

Um use case orquestra o domínio, mas fala com o mundo externo (banco,
etc.) apenas através de interfaces abstratas definidas em
`application/interfaces/`, nunca com implementações concretas.
"""
