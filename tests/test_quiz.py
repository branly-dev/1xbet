import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app
from database import get_db
from models.quiz import Base, User, UserRoleEnum, QuizCategory, Quiz, QuizQuestion, QuizAnswer, QuizStatutEnum, NiveauAccesEnum, QuestionTypeEnum
from auth import create_access_token

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_juris_mind.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    admin_user = User(id=1, full_name="Admin Test", role=UserRoleEnum.admin, is_premium=True)
    juriste_user = User(id=2, full_name="Juriste Test", role=UserRoleEnum.juriste, is_premium=False)
    citoyen_user = User(id=3, full_name="Citoyen Test", role=UserRoleEnum.citoyen, is_premium=False)
    citoyen_premium = User(id=4, full_name="Citoyen Premium", role=UserRoleEnum.citoyen, is_premium=True)

    db.add_all([admin_user, juriste_user, citoyen_user, citoyen_premium])
    db.commit()
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

def get_auth_headers(user_id: int):
    token = create_access_token({"sub": str(user_id)})
    return {"Authorization": f"Bearer {token}"}

def test_admin_category_creation():
    headers = get_auth_headers(1)
    res = client.post("/admin/quiz/category", json={"nom": "Droit du travail", "description": "Lois du travail au Cameroun", "langue": "fr"}, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert data["nom"] == "Droit du travail"
    assert "id" in data

def test_admin_quiz_creation_and_question():
    headers = get_auth_headers(2)
    cat_res = client.post("/admin/quiz/category", json={"nom": "Droit Commercial", "langue": "fr"}, headers=headers)
    cat_id = cat_res.json()["id"]

    quiz_res = client.post("/admin/quiz", json={
        "category_id": cat_id,
        "titre": "Introduction OHADA",
        "niveau": "debutant",
        "niveau_acces": "gratuit",
        "langue": "fr"
    }, headers=headers)
    assert quiz_res.status_code == 201
    quiz_data = quiz_res.json()
    assert quiz_data["statut"] == "brouillon"
    quiz_id = quiz_data["id"]

    q_res = client.post(f"/admin/quiz/{quiz_id}/question", json={
        "texte": "Quel est le siège de l'OHADA ?",
        "type": "qcm_simple",
        "explication": "Le Secrétariat Permanent est à Yaoundé.",
        "source_reference": "Traité OHADA Art 3",
        "ordre": 1,
        "answers": [
            {"texte": "Yaoundé", "est_correcte": True},
            {"texte": "Douala", "est_correcte": False},
            {"texte": "Abidjan", "est_correcte": False}
        ]
    }, headers=headers)
    assert q_res.status_code == 201
    assert len(q_res.json()["answers"]) == 3

def test_publish_and_public_retrieval_without_exposing_correct_answers():
    headers_juriste = get_auth_headers(2)
    headers_citoyen = get_auth_headers(3)

    cat_res = client.post("/admin/quiz/category", json={"nom": "Droit Foncier"}, headers=headers_juriste)
    cat_id = cat_res.json()["id"]

    quiz_res = client.post("/admin/quiz", json={"category_id": cat_id, "titre": "Titre Foncier", "niveau_acces": "gratuit"}, headers=headers_juriste)
    quiz_id = quiz_res.json()["id"]

    client.post(f"/admin/quiz/{quiz_id}/question", json={
        "texte": "Le titre foncier est-il inattaquable ?",
        "type": "vrai_faux",
        "answers": [
            {"texte": "Vrai", "est_correcte": True},
            {"texte": "Faux", "est_correcte": False}
        ]
    }, headers=headers_juriste)

    res_draft = client.get(f"/quiz/{quiz_id}", headers=headers_citoyen)
    assert res_draft.status_code == 403

    pub_res = client.patch(f"/admin/quiz/{quiz_id}/publish", headers=headers_juriste)
    assert pub_res.status_code == 200
    assert pub_res.json()["statut"] == "publie"

    res_pub = client.get(f"/quiz/{quiz_id}", headers=headers_citoyen)
    assert res_pub.status_code == 200
    data = res_pub.json()
    assert len(data["questions"]) == 1
    for ans in data["questions"][0]["answers"]:
        assert "est_correcte" not in ans

def test_premium_access_control():
    headers_juriste = get_auth_headers(2)
    headers_citoyen = get_auth_headers(3)
    headers_premium = get_auth_headers(4)

    cat_res = client.post("/admin/quiz/category", json={"nom": "Fiscalité"}, headers=headers_juriste)
    cat_id = cat_res.json()["id"]

    quiz_res = client.post("/admin/quiz", json={"category_id": cat_id, "titre": "Taxes Entreprises", "niveau_acces": "premium"}, headers=headers_juriste)
    quiz_id = quiz_res.json()["id"]
    client.patch(f"/admin/quiz/{quiz_id}/publish", headers=headers_juriste)

    res_free = client.get(f"/quiz/{quiz_id}", headers=headers_citoyen)
    assert res_free.status_code == 403

    res_prem = client.get(f"/quiz/{quiz_id}", headers=headers_premium)
    assert res_prem.status_code == 200

def test_quiz_submission_and_scoring():
    headers_juriste = get_auth_headers(2)
    headers_citoyen = get_auth_headers(3)

    cat_res = client.post("/admin/quiz/category", json={"nom": "Droit Pénal"}, headers=headers_juriste)
    cat_id = cat_res.json()["id"]

    quiz_res = client.post("/admin/quiz", json={"category_id": cat_id, "titre": "Infractions", "niveau_acces": "gratuit"}, headers=headers_juriste)
    quiz_id = quiz_res.json()["id"]

    q_res = client.post(f"/admin/quiz/{quiz_id}/question", json={
        "texte": "Sanction du vol ?",
        "type": "qcm_simple",
        "explication": "Art 318 Code Pénal",
        "answers": [
            {"texte": "Emprisonnement", "est_correcte": True},
            {"texte": "Amende uniquement", "est_correcte": False}
        ]
    }, headers=headers_juriste)
    q_data = q_res.json()
    q_id = q_data["id"]
    correct_ans_id = [a["id"] for a in q_data["answers"] if a["texte"] == "Emprisonnement"][0]

    client.patch(f"/admin/quiz/{quiz_id}/publish", headers=headers_juriste)

    sub_res = client.post(f"/quiz/{quiz_id}/submit", json={
        "reponses": [
            {"question_id": q_id, "selected_answer_ids": [correct_ans_id]}
        ]
    }, headers=headers_citoyen)
    assert sub_res.status_code == 200
    res_data = sub_res.json()
    assert res_data["score"] == 1
    assert res_data["points_gagnes"] == 10
    assert res_data["corrections"][0]["est_correcte"] is True

    prog_res = client.get("/quiz/me/progress", headers=headers_citoyen)
    assert prog_res.status_code == 200
    assert prog_res.json()["points_total"] == 10
    assert prog_res.json()["streak_jours"] == 1
