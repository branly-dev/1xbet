"""create quiz tables

Revision ID: 24f39997d3b3
Revises:
Create Date: 2026-08-25 01:24:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '24f39997d3b3'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('phone_number', sa.String(length=50), nullable=True),
        sa.Column('role', sa.Enum('citoyen', 'juriste', 'admin', name='userroleenum'), nullable=False),
        sa.Column('is_premium', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_phone_number'), 'users', ['phone_number'], unique=True)

    op.create_table(
        'quiz_categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nom', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('langue', sa.String(length=10), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_quiz_categories_id'), 'quiz_categories', ['id'], unique=False)

    op.create_table(
        'quizzes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('titre', sa.String(length=255), nullable=False),
        sa.Column('niveau', sa.Enum('debutant', 'intermediaire', 'avance', name='niveauenum'), nullable=False),
        sa.Column('niveau_acces', sa.Enum('gratuit', 'premium', name='niveauaccesenum'), nullable=False),
        sa.Column('langue', sa.String(length=10), nullable=False),
        sa.Column('statut', sa.Enum('brouillon', 'publie', name='quizstatutenum'), nullable=False),
        sa.Column('auteur_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['auteur_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['category_id'], ['quiz_categories.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_quizzes_auteur_id'), 'quizzes', ['auteur_id'], unique=False)
    op.create_index(op.f('ix_quizzes_category_id'), 'quizzes', ['category_id'], unique=False)
    op.create_index(op.f('ix_quizzes_id'), 'quizzes', ['id'], unique=False)

    op.create_table(
        'quiz_questions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('quiz_id', sa.Integer(), nullable=False),
        sa.Column('texte', sa.Text(), nullable=False),
        sa.Column('type', sa.Enum('qcm_simple', 'qcm_multiple', 'vrai_faux', name='questiontypeenum'), nullable=False),
        sa.Column('explication', sa.Text(), nullable=True),
        sa.Column('source_reference', sa.String(length=255), nullable=True),
        sa.Column('ordre', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['quiz_id'], ['quizzes.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_quiz_questions_id'), 'quiz_questions', ['id'], unique=False)
    op.create_index(op.f('ix_quiz_questions_quiz_id'), 'quiz_questions', ['quiz_id'], unique=False)

    op.create_table(
        'quiz_answers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('question_id', sa.Integer(), nullable=False),
        sa.Column('texte', sa.Text(), nullable=False),
        sa.Column('est_correcte', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['question_id'], ['quiz_questions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_quiz_answers_id'), 'quiz_answers', ['id'], unique=False)
    op.create_index(op.f('ix_quiz_answers_question_id'), 'quiz_answers', ['question_id'], unique=False)

    op.create_table(
        'quiz_attempts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('quiz_id', sa.Integer(), nullable=False),
        sa.Column('score', sa.Integer(), nullable=False),
        sa.Column('date_debut', sa.DateTime(), nullable=True),
        sa.Column('date_fin', sa.DateTime(), nullable=True),
        sa.Column('reponses_detail', sa.JSON(), nullable=True),
        sa.Column('termine', sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(['quiz_id'], ['quizzes.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_quiz_attempts_id'), 'quiz_attempts', ['id'], unique=False)
    op.create_index(op.f('ix_quiz_attempts_quiz_id'), 'quiz_attempts', ['quiz_id'], unique=False)
    op.create_index(op.f('ix_quiz_attempts_user_id'), 'quiz_attempts', ['user_id'], unique=False)

    op.create_table(
        'user_quiz_progress',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('points_total', sa.Integer(), nullable=False),
        sa.Column('niveau_utilisateur', sa.String(length=50), nullable=False),
        sa.Column('streak_jours', sa.Integer(), nullable=False),
        sa.Column('derniere_activite', sa.DateTime(), nullable=True),
        sa.Column('badges', sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_user_quiz_progress_id'), 'user_quiz_progress', ['id'], unique=False)
    op.create_index(op.f('ix_user_quiz_progress_user_id'), 'user_quiz_progress', ['user_id'], unique=True)

def downgrade() -> None:
    op.drop_table('user_quiz_progress')
    op.drop_table('quiz_attempts')
    op.drop_table('quiz_answers')
    op.drop_table('quiz_questions')
    op.drop_table('quizzes')
    op.drop_table('quiz_categories')
    op.drop_table('users')
