class EmailJaCadastradoError(Exception):
    """Lançado quando se tenta registrar um usuário com um email já existente."""

    pass


class CredenciaisInvalidasError(Exception):
    """Lançado quando o email ou a senha informados no login não conferem."""

    pass


class ProvaNaoEncontradaError(Exception):
    """
    Lançado quando uma prova não existe, ou existe mas pertence a
    outro usuário. As duas situações usam a mesma exceção de
    propósito -- por segurança, um usuário não deve conseguir
    descobrir se uma prova de outra pessoa existe ou não.
    """

    pass


class SessaoNaoEncontradaError(Exception):
    """Mesma lógica de ProvaNaoEncontradaError, aplicada a sessões de estudo."""

    pass


class SessaoJaFinalizadaError(Exception):
    """Lançado ao tentar finalizar uma sessão que já foi finalizada antes."""

    pass


class RevisaoNaoEncontradaError(Exception):
    """Mesma lógica de ProvaNaoEncontradaError, aplicada a revisões."""

    pass


class RevisaoJaConcluidaError(Exception):
    """Lançado ao tentar concluir uma revisão que já foi concluída antes."""

    pass


class RevisaoNaoEncontradaError(Exception):
    """Mesma lógica de ProvaNaoEncontradaError, aplicada a revisões."""

    pass


class RevisaoJaConcluidaError(Exception):
    """Lançado ao tentar concluir uma revisão que já foi concluída antes."""

    pass

class ProvaComDadosVinculadosError(Exception):
    """
    Lançado ao tentar excluir uma prova que já tem sessões de estudo
    ou revisões vinculadas. Em vez de excluir, o usuário deve arquivar.
    """

    pass

class DisciplinaNaoEncontradaError(Exception):
    """Mesma lógica de ProvaNaoEncontradaError, aplicada a disciplinas."""

    pass


class TopicoNaoEncontradoError(Exception):
    """Mesma lógica, aplicada a tópicos."""

    pass

class TokenInvalidoError(Exception):
    pass

class ProvaNaoDisponivelError(Exception):
    pass