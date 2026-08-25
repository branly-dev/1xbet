from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models.quiz import (
    User, UserRoleEnum, QuizCategory, Quiz, QuizQuestion, QuizAnswer,
    QuizAttempt, UserQuizProgress, QuizStatutEnum, QuestionTypeEnum, NiveauAccesEnum
)
from schemas.quiz import (
    QuizCategoryCreate, QuizCategoryOut, QuizCreate, QuizOut,
    QuizQuestionCreate, QuizQuestionOut, QuizUpdateStatus, QuizPublicOut,
    QuizSubmission, QuizResult, QuizCorrectionDetail, UserQuizProgressOut
)
from auth import get_current_user, require_roles, verify_premium_access

router = APIRouter()

# ==========================================
# PUBLIC / CITIZEN ROUTES (JWT Protected)
# ==========================================

@router.get("/quiz/categories", response_model=List[QuizCategoryOut])
def get_categories(
    langue: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(QuizCategory)
    if langue:
        query = query.filter(QuizCategory.langue == langue)
    return query.all()

@router.get("/quiz/category/{category_id}/quizzes", response_model=List[QuizPublicOut])
def get_quizzes_by_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = db.query(QuizCategory).filter(QuizCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Catégorie non trouvée")

    quizzes = db.query(Quiz).filter(
        Quiz.category_id == category_id,
        Quiz.statut == QuizStatutEnum.publie
    ).all()

    allowed_quizzes = []
    for quiz in quizzes:
        if quiz.niveau_acces == NiveauAccesEnum.premium and not current_user.is_premium:
            continue
        allowed_quizzes.append(quiz)

    return allowed_quizzes

@router.get("/quiz/{quiz_id}", response_model=QuizPublicOut)
def get_quiz_detail(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quiz = db.query(Quiz).options(
        joinedload(Quiz.questions).joinedload(QuizQuestion.answers)
    ).filter(Quiz.id == quiz_id).first()

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz non trouvé")

    if quiz.statut != QuizStatutEnum.publie and current_user.role not in [UserRoleEnum.juriste, UserRoleEnum.admin]:
        raise HTTPException(status_code=403, detail="Ce quiz n'est pas publié")

    verify_premium_access(quiz, current_user)

    return quiz

@router.post("/quiz/{quiz_id}/submit", response_model=QuizResult)
def submit_quiz(
    quiz_id: int,
    submission: QuizSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    quiz = db.query(Quiz).options(
        joinedload(Quiz.questions).joinedload(QuizQuestion.answers)
    ).filter(Quiz.id == quiz_id).first()

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz non trouvé")

    verify_premium_access(quiz, current_user)

    user_submissions_map = {item.question_id: set(item.selected_answer_ids) for item in submission.reponses}

    corrections: List[QuizCorrectionDetail] = []
    score = 0
    total_questions = len(quiz.questions)

    for q in quiz.questions:
        correct_answer_ids = {a.id for a in q.answers if a.est_correcte}
        user_selected = user_submissions_map.get(q.id, set())

        is_correct = (user_selected == correct_answer_ids) and (len(correct_answer_ids) > 0)
        if is_correct:
            score += 1

        corrections.append(QuizCorrectionDetail(
            question_id=q.id,
            est_correcte=is_correct,
            correct_answer_ids=list(correct_answer_ids),
            explication=q.explication,
            source_reference=q.source_reference
        ))

    points_gagnes = score * 10

    progress = db.query(UserQuizProgress).filter(UserQuizProgress.user_id == current_user.id).first()
    now = datetime.now(timezone.utc)

    if not progress:
        progress = UserQuizProgress(
            user_id=current_user.id,
            points_total=0,
            niveau_utilisateur="Débutant",
            streak_jours=1,
            derniere_activite=now,
            badges=[]
        )
        db.add(progress)
    else:
        if progress.derniere_activite:
            last_date = progress.derniere_activite.date() if isinstance(progress.derniere_activite, datetime) else progress.derniere_activite
            today = now.date()
            if today == last_date:
                pass
            elif today == last_date + timedelta(days=1):
                progress.streak_jours += 1
                points_gagnes += 5
            else:
                progress.streak_jours = 1
        else:
            progress.streak_jours = 1
        progress.derniere_activite = now

    progress.points_total += points_gagnes

    if progress.points_total >= 500:
        progress.niveau_utilisateur = "Expert"
    elif progress.points_total >= 200:
        progress.niveau_utilisateur = "Intermédiaire"
    else:
        progress.niveau_utilisateur = "Débutant"

    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz.id,
        score=points_gagnes,
        date_debut=now,
        date_fin=now,
        reponses_detail=[item.model_dump() for item in submission.reponses],
        termine=True
    )
    db.add(attempt)
    db.commit()
    db.refresh(progress)

    return QuizResult(
        quiz_id=quiz.id,
        score=score,
        total_questions=total_questions,
        points_gagnes=points_gagnes,
        streak_actuel=progress.streak_jours,
        corrections=corrections
    )

@router.get("/quiz/me/progress", response_model=UserQuizProgressOut)
def get_user_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    progress = db.query(UserQuizProgress).filter(UserQuizProgress.user_id == current_user.id).first()
    if not progress:
        progress = UserQuizProgress(
            user_id=current_user.id,
            points_total=0,
            niveau_utilisateur="Débutant",
            streak_jours=0,
            derniere_activite=None,
            badges=[]
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)
    return progress

# ==========================================
# ADMIN / JURISTE ROUTES (Role Protected)
# ==========================================

@router.post("/admin/quiz/category", response_model=QuizCategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: QuizCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.juriste, UserRoleEnum.admin]))
):
    category = QuizCategory(**category_in.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.post("/admin/quiz", response_model=QuizOut, status_code=status.HTTP_201_CREATED)
def create_quiz(
    quiz_in: QuizCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.juriste, UserRoleEnum.admin]))
):
    category = db.query(QuizCategory).filter(QuizCategory.id == quiz_in.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Catégorie invalide")

    quiz_data = quiz_in.model_dump()
    quiz = Quiz(
        **quiz_data,
        auteur_id=current_user.id
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return quiz

@router.post("/admin/quiz/{quiz_id}/question", response_model=QuizQuestionOut, status_code=status.HTTP_201_CREATED)
def add_question_to_quiz(
    quiz_id: int,
    question_in: QuizQuestionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.juriste, UserRoleEnum.admin]))
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz non trouvé")

    question_data = question_in.model_dump()
    answers_data = question_data.pop("answers", [])

    question = QuizQuestion(**question_data, quiz_id=quiz.id)
    db.add(question)
    db.commit()
    db.refresh(question)

    for ans_data in answers_data:
        ans = QuizAnswer(**ans_data, question_id=question.id)
        db.add(ans)

    db.commit()
    db.refresh(question)
    return question

@router.patch("/admin/quiz/{quiz_id}/publish", response_model=QuizOut)
def publish_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.juriste, UserRoleEnum.admin]))
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz non trouvé")

    quiz.statut = QuizStatutEnum.publie
    db.commit()
    db.refresh(quiz)
    return quiz

@router.get("/admin/quiz", response_model=List[QuizOut])
def list_admin_quizzes(
    statut: Optional[QuizStatutEnum] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRoleEnum.juriste, UserRoleEnum.admin]))
):
    query = db.query(Quiz).options(joinedload(Quiz.category), joinedload(Quiz.questions).joinedload(QuizQuestion.answers))
    if statut:
        query = query.filter(Quiz.statut == statut)
    if category_id:
        query = query.filter(Quiz.category_id == category_id)
    return query.all()
