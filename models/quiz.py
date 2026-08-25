import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum, JSON
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class UserRoleEnum(str, enum.Enum):
    citoyen = "citoyen"
    juriste = "juriste"
    admin = "admin"

class NiveauEnum(str, enum.Enum):
    debutant = "debutant"
    intermediaire = "intermediaire"
    avance = "avance"

class NiveauAccesEnum(str, enum.Enum):
    gratuit = "gratuit"
    premium = "premium"

class QuizStatutEnum(str, enum.Enum):
    brouillon = "brouillon"
    publie = "publie"

class QuestionTypeEnum(str, enum.Enum):
    qcm_simple = "qcm_simple"
    qcm_multiple = "qcm_multiple"
    vrai_faux = "vrai_faux"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    phone_number = Column(String(50), unique=True, index=True, nullable=True)
    role = Column(SQLEnum(UserRoleEnum), default=UserRoleEnum.citoyen, nullable=False)
    is_premium = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    quizzes = relationship("Quiz", back_populates="auteur", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    progress = relationship("UserQuizProgress", back_populates="user", uselist=False, cascade="all, delete-orphan")

class QuizCategory(Base):
    __tablename__ = "quiz_categories"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    langue = Column(String(10), default="fr", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    quizzes = relationship("Quiz", back_populates="category", cascade="all, delete-orphan")

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("quiz_categories.id"), nullable=False, index=True)
    titre = Column(String(255), nullable=False)
    niveau = Column(SQLEnum(NiveauEnum), default=NiveauEnum.debutant, nullable=False)
    niveau_acces = Column(SQLEnum(NiveauAccesEnum), default=NiveauAccesEnum.gratuit, nullable=False)
    langue = Column(String(10), default="fr", nullable=False)
    statut = Column(SQLEnum(QuizStatutEnum), default=QuizStatutEnum.brouillon, nullable=False)
    auteur_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    category = relationship("QuizCategory", back_populates="quizzes")
    auteur = relationship("User", back_populates="quizzes")
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan", order_by="QuizQuestion.ordre")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False, index=True)
    texte = Column(Text, nullable=False)
    type = Column(SQLEnum(QuestionTypeEnum), default=QuestionTypeEnum.qcm_simple, nullable=False)
    explication = Column(Text, nullable=True)
    source_reference = Column(String(255), nullable=True)
    ordre = Column(Integer, default=1, nullable=False)

    quiz = relationship("Quiz", back_populates="questions")
    answers = relationship("QuizAnswer", back_populates="question", cascade="all, delete-orphan")

class QuizAnswer(Base):
    __tablename__ = "quiz_answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("quiz_questions.id"), nullable=False, index=True)
    texte = Column(Text, nullable=False)
    est_correcte = Column(Boolean, default=False, nullable=False)

    question = relationship("QuizQuestion", back_populates="answers")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False, index=True)
    score = Column(Integer, default=0, nullable=False)
    date_debut = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    date_fin = Column(DateTime, nullable=True)
    reponses_detail = Column(JSON, nullable=True)
    termine = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="attempts")
    quiz = relationship("Quiz", back_populates="attempts")

class UserQuizProgress(Base):
    __tablename__ = "user_quiz_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    points_total = Column(Integer, default=0, nullable=False)
    niveau_utilisateur = Column(String(50), default="Débutant", nullable=False)
    streak_jours = Column(Integer, default=0, nullable=False)
    derniere_activite = Column(DateTime, nullable=True)
    badges = Column(JSON, default=list, nullable=False)

    user = relationship("User", back_populates="progress")
