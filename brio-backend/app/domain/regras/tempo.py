from datetime import date, datetime, timezone
from zoneinfo import ZoneInfo

# Fuso do calendário do produto. Os momentos continuam sendo gravados em UTC
# (correto); este fuso só decide "em que dia do Brasil isso caiu".
FUSO_BRASIL = ZoneInfo("America/Sao_Paulo")


def agora_local() -> datetime:
    return datetime.now(FUSO_BRASIL)


def hoje_local() -> date:
    return agora_local().date()


def data_local(momento: datetime) -> date:
    if momento.tzinfo is None:
        momento = momento.replace(tzinfo=timezone.utc)
    return momento.astimezone(FUSO_BRASIL).date()