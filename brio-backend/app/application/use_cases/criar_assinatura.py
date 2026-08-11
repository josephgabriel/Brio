# app/application/use_cases/criar_assinatura.py
from app.application.interfaces.assinatura_repository import AssinaturaRepository
from app.domain.exceptions import AssinaturaJaExisteError
from app.domain.regras.assinatura import PRECOS
from app.infrastructure.config import settings
from app.infrastructure.db.models.assinatura import AssinaturaModel, Plano, StatusAssinatura
from app.infrastructure.db.models.usuario import UsuarioModel
from app.infrastructure.pagamentos.mercadopago_client import MercadoPagoClient

FREQUENCIA_MESES = {Plano.MENSAL: 1, Plano.ANUAL: 12}


class CriarAssinatura:
    def __init__(
        self, repository: AssinaturaRepository, mercadopago_client: MercadoPagoClient
    ) -> None:
        self.repository = repository
        self.mercadopago_client = mercadopago_client

    def executar(self, usuario: UsuarioModel, plano: Plano) -> str:
        existente = self.repository.buscar_por_usuario(usuario.id)
        if existente is not None and existente.status == StatusAssinatura.ATIVA:
            raise AssinaturaJaExisteError("Você já possui uma assinatura ativa")

        preapproval = self.mercadopago_client.criar_preapproval(
            email_pagador=usuario.email,
            valor=PRECOS[plano],
            frequencia_meses=FREQUENCIA_MESES[plano],
            motivo=f"Brio - Plano {plano.value.capitalize()}",
            referencia_externa=str(usuario.id),
            back_url=f"{settings.frontend_url}/assinatura/retorno",
        )

        if existente is None:
            self.repository.criar(
                AssinaturaModel(
                    usuario_id=usuario.id,
                    plano=plano,
                    status=StatusAssinatura.PENDENTE,
                    mercadopago_preapproval_id=preapproval["id"],
                )
            )
        else:
            existente.plano = plano
            existente.status = StatusAssinatura.PENDENTE
            existente.mercadopago_preapproval_id = preapproval["id"]
            self.repository.atualizar(existente)

        return preapproval["init_point"]