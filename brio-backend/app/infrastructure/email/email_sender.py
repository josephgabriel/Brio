from abc import ABC, abstractmethod

import resend

from app.infrastructure.config import settings


class EmailSender(ABC):
    @abstractmethod
    def enviar(self, destinatario: str, assunto: str, corpo_texto: str) -> None: ...


class ConsoleEmailSender(EmailSender):
    def enviar(self, destinatario: str, assunto: str, corpo_texto: str) -> None:
        print("\n" + "=" * 60)
        print(f"[EMAIL] Para: {destinatario}")
        print(f"[EMAIL] Assunto: {assunto}")
        print("-" * 60)
        print(corpo_texto)
        print("=" * 60 + "\n")


class ResendEmailSender(EmailSender):
    def __init__(self) -> None:
        resend.api_key = settings.resend_api_key

    def enviar(self, destinatario: str, assunto: str, corpo_texto: str) -> None:
        resend.Emails.send(
            {
                "from": settings.email_remetente,
                "to": [destinatario],
                "subject": assunto,
                "text": corpo_texto,
            }
        )


def obter_email_sender() -> EmailSender:
    if settings.environment == "production":
        return ResendEmailSender()
    return ConsoleEmailSender()