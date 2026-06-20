from typing import List, Optional

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .. import models, schemas
from .config import settings
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Avaliação Bariátrica API", version="1.0.0")

origins = (
    ["*"]
    if settings.frontend_origin == "*"
    else [o.strip() for o in settings.frontend_origin.split(",")]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def verificar_api_key(x_api_key: Optional[str] = Header(default=None)):
    """Protege rotas administrativas com uma chave simples vinda do .env."""
    if not x_api_key or x_api_key != settings.api_key:
        raise HTTPException(status_code=401, detail="API key inválida ou ausente")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/leads", response_model=schemas.LeadOut, status_code=201)
def criar_lead(lead: schemas.LeadCreate, db: Session = Depends(get_db)):
    """Recebe os dados do formulário do site e grava no banco."""
    novo_lead = models.Lead(**lead.model_dump())
    db.add(novo_lead)
    db.commit()
    db.refresh(novo_lead)
    return novo_lead


@app.get(
    "/api/leads",
    response_model=List[schemas.LeadOut],
    dependencies=[Depends(verificar_api_key)],
)
def listar_leads(db: Session = Depends(get_db), limit: int = 100, offset: int = 0):
    """Lista os leads capturados, do mais recente para o mais antigo.
    Protegido por header X-API-Key. Use para alimentar um painel/admin depois."""
    return (
        db.query(models.Lead)
        .order_by(models.Lead.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
