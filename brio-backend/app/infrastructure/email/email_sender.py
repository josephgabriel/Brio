from abc import ABC, abstractmethod

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