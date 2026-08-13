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
    def enviar(
        self,
        destinatario: str,
        assunto: str,
        corpo_texto: str,
        corpo_html: str | None = None,
    ) -> None:
        params = {
            "from": settings.email_remetente,
            "to": [destinatario],
            "subject": assunto,
            "text": corpo_texto,
        }

        if corpo_html:
            params["html"] = corpo_html

        resend.Emails.send(params)


def obter_email_sender() -> EmailSender:
    if settings.environment == "production":
        return ResendEmailSender()
    return ConsoleEmailSender()