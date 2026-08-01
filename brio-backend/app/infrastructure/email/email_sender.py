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
    """
    Implementação real, usando a API do Resend. Substitui o
    ConsoleEmailSender em produção -- nenhum use case precisa mudar,
    já que ambos implementam a mesma interface EmailSender.
    """

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
    """
    Decide qual implementação usar, baseado no ambiente -- centraliza
    essa escolha aqui, em vez de espalhar `if` pelos routers.
    """
    if settings.environment == "production":
        return ResendEmailSender()
    return ConsoleEmailSender()