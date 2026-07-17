from pydantic import BaseModel, ConfigDict, EmailStr, Field

class UsuarioCreateSchema(BaseModel):
    nome: str = Field(min_length=2, max_length=200)
    email: EmailStr
    senha: str = Field(min_length=8, max_length=100)

class UsuarioResponseSchema(BaseModel):
    id: int
    nome: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)

class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"