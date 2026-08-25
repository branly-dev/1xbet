from fastapi import FastAPI
from database import engine
from models.quiz import Base
from routers.quiz import router as quiz_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="JurisMind API",
    description="API pour l'assistance juridique et module de quiz au Cameroun",
    version="1.0.0"
)

app.include_router(quiz_router, tags=["Quiz"])

@app.get("/")
def read_root():
    return {"message": "Bienvenue sur l'API JurisMind"}
