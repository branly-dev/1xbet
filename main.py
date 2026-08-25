from fastapi import FastAPI
from fastapi.responses import FileResponse
import os

from database import engine
from models.quiz import Base
from routers.quiz import router as quiz_router
from routers.auth_demo import auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="JurisMind API",
    description="API pour l'assistance juridique et module de quiz au Cameroun",
    version="1.0.0"
)

app.include_router(quiz_router, tags=["Quiz"])
app.include_router(auth_router, tags=["Auth Demo"])

@app.get("/", response_class=FileResponse)
def read_root():
    if os.path.exists("login_blue.html"):
        return FileResponse("login_blue.html")
    return {"message": "Bienvenue sur l'API JurisMind"}
