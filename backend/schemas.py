from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class LeadCreate(BaseModel):
    nome: str = Field(..., min_length=1, max_length=120)
    whatsapp: str = Field(..., min_length=10, max_length=20)
    peso: float = Field(..., gt=0, le=400)
    altura: float = Field(..., gt=0, le=250)
    idade: int = Field(..., ge=0, le=130)
    diabetes: bool = False
    hipertensao: bool = False
    imc: float = Field(..., gt=0)
    classificacao: str = Field(..., max_length=60)
    probabilidade: int = Field(..., ge=0, le=100)

    @field_validator("whatsapp")
    @classmethod
    def somente_digitos(cls, v: str) -> str:
        digitos = "".join(c for c in v if c.isdigit())
        if len(digitos) < 10 or len(digitos) > 11:
            raise ValueError("WhatsApp deve ter 10 ou 11 dígitos (DDD + número)")
        return digitos


class LeadOut(LeadCreate):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
