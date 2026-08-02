import time

_ULTIMO_ENVIO: dict[str, float] = {}

COOLDOWN_SEGUNDOS = 60

def pode_reenviar(chave: str) -> bool:
    ultimo = _ULTIMO_ENVIO.get(chave)

    if ultimo is None:
        return True
    
    return (time.time() - ultimo) >= COOLDOWN_SEGUNDOS

def registrar_envio(chave: str) -> None:
    _ULTIMO_ENVIO[chave] = time.time()