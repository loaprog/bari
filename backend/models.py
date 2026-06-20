from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from sqlalchemy.sql import func

from .database import Base


class Lead(Base):
    """Cada linha = um envio do formulário de avaliação bariátrica."""

    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    whatsapp = Column(String(20), nullable=False, index=True)  # somente dígitos

    peso = Column(Float, nullable=False)
    altura = Column(Float, nullable=False)  # em cm
    idade = Column(Integer, nullable=False)

    diabetes = Column(Boolean, nullable=False, default=False)
    hipertensao = Column(Boolean, nullable=False, default=False)

    imc = Column(Float, nullable=False)
    classificacao = Column(String(60), nullable=False)
    probabilidade = Column(Integer, nullable=False)  # 0-100

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
