from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from models.quiz import NiveauEnum, NiveauAccesEnum, QuizStatutEnum, QuestionTypeEnum

# --- Quiz Category Schemas ---
class QuizCategoryBase(BaseModel):
    nom: str
    description: Optional[str] = None
    langue: str = "fr"

class QuizCategoryCreate(QuizCategoryBase):
    pass

class QuizCategoryOut(QuizCategoryBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Quiz Answer Schemas ---
class QuizAnswerBase(BaseModel):
    texte: str

class QuizAnswerCreate(QuizAnswerBase):
    est_correcte: bool = False

class QuizAnswerOut(QuizAnswerBase):
    id: int
    question_id: int
    est_correcte: bool
    model_config = ConfigDict(from_attributes=True)

class QuizAnswerPublic(QuizAnswerBase):
    id: int
    question_id: int
    model_config = ConfigDict(from_attributes=True)

# --- Quiz Question Schemas ---
class QuizQuestionBase(BaseModel):
    texte: str
    type: QuestionTypeEnum = QuestionTypeEnum.qcm_simple
    explication: Optional[str] = None
    source_reference: Optional[str] = None
    ordre: int = 1

class QuizQuestionCreate(QuizQuestionBase):
    answers: List[QuizAnswerCreate]

class QuizQuestionOut(QuizQuestionBase):
    id: int
    quiz_id: int
    answers: List[QuizAnswerOut] = []
    model_config = ConfigDict(from_attributes=True)

class QuizQuestionPublic(BaseModel):
    id: int
    quiz_id: int
    texte: str
    type: QuestionTypeEnum
    source_reference: Optional[str] = None
    ordre: int
    answers: List[QuizAnswerPublic] = []
    model_config = ConfigDict(from_attributes=True)

# --- Quiz Schemas ---
class QuizBase(BaseModel):
    category_id: int
    titre: str
    niveau: NiveauEnum = NiveauEnum.debutant
    niveau_acces: NiveauAccesEnum = NiveauAccesEnum.gratuit
    langue: str = "fr"

class QuizCreate(QuizBase):
    statut: QuizStatutEnum = QuizStatutEnum.brouillon

class QuizUpdateStatus(BaseModel):
    statut: QuizStatutEnum

class QuizOut(QuizBase):
    id: int
    statut: QuizStatutEnum
    auteur_id: int
    created_at: datetime
    updated_at: datetime
    category: Optional[QuizCategoryOut] = None
    questions: List[QuizQuestionOut] = []
    model_config = ConfigDict(from_attributes=True)

class QuizPublicOut(QuizBase):
    id: int
    statut: QuizStatutEnum
    auteur_id: int
    created_at: datetime
    questions: List[QuizQuestionPublic] = []
    model_config = ConfigDict(from_attributes=True)

# --- Submission & Result Schemas ---
class QuizSubmissionDetail(BaseModel):
    question_id: int
    selected_answer_ids: List[int]

class QuizSubmission(BaseModel):
    reponses: List[QuizSubmissionDetail]

class QuizCorrectionDetail(BaseModel):
    question_id: int
    est_correcte: bool
    correct_answer_ids: List[int]
    explication: Optional[str] = None
    source_reference: Optional[str] = None

class QuizResult(BaseModel):
    quiz_id: int
    score: int
    total_questions: int
    points_gagnes: int
    streak_actuel: int
    corrections: List[QuizCorrectionDetail]

# --- User Progress Schemas ---
class UserQuizProgressOut(BaseModel):
    id: int
    user_id: int
    points_total: int
    niveau_utilisateur: str
    streak_jours: int
    derniere_activite: Optional[datetime] = None
    badges: List[str] = []
    model_config = ConfigDict(from_attributes=True)
