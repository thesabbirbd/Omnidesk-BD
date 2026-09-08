"""v1_2_4_phase1_multilingual_provenance_isolation

Revision ID: 5a168c28eace
Revises: 2a6027285adc
Create Date: 2026-09-08 22:58:33.371816

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5a168c28eace'
down_revision: Union[str, Sequence[str], None] = '2a6027285adc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Ensure Enum type exists
    source_type_enum = sa.Enum('USER_CREATED', 'SOURCE_EXTRACTED', 'AI_INFERRED', 'MIXED', name='source_type_enum')
    source_type_enum.create(op.get_bind(), checkfirst=True)

    # 2. Materials
    op.add_column('materials', sa.Column('source_language', sa.String(length=10), nullable=False, server_default='en'))

    # 3. StudySpaces
    op.add_column('study_spaces', sa.Column('interface_language', sa.String(length=10), nullable=False, server_default='en'))
    op.add_column('study_spaces', sa.Column('learning_language', sa.String(length=10), nullable=False, server_default='en'))
    op.add_column('study_spaces', sa.Column('source_language', sa.String(length=10), nullable=False, server_default='en'))

    # 4. Tasks
    op.add_column('tasks', sa.Column('source_type', source_type_enum, nullable=False, server_default='USER_CREATED'))
    op.add_column('tasks', sa.Column('source_reference', sa.String(length=500), nullable=True))
    op.add_column('tasks', sa.Column('confidence_score', sa.Float(), nullable=False, server_default='1.0'))
    op.create_index(op.f('ix_tasks_source_type'), 'tasks', ['source_type'], unique=False)

    # 5. Topics - add user_id nullable first, backfill from study_spaces, then alter to nullable=False
    op.add_column('topics', sa.Column('user_id', sa.Uuid(), nullable=True))
    op.execute("UPDATE topics SET user_id = study_spaces.user_id FROM study_spaces WHERE topics.study_space_id = study_spaces.id")
    op.alter_column('topics', 'user_id', nullable=False)

    op.add_column('topics', sa.Column('source_type', source_type_enum, nullable=False, server_default='USER_CREATED'))
    op.add_column('topics', sa.Column('source_reference', sa.String(length=500), nullable=True))
    op.add_column('topics', sa.Column('source_material_id', sa.Uuid(), nullable=True))
    op.add_column('topics', sa.Column('confidence_score', sa.Float(), nullable=False, server_default='1.0'))
    op.create_index(op.f('ix_topics_source_material_id'), 'topics', ['source_material_id'], unique=False)
    op.create_index(op.f('ix_topics_source_type'), 'topics', ['source_type'], unique=False)
    op.create_index(op.f('ix_topics_user_id'), 'topics', ['user_id'], unique=False)
    op.create_foreign_key('fk_topics_user_id_users', 'topics', 'users', ['user_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('fk_topics_source_material_id_materials', 'topics', 'materials', ['source_material_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_topics_source_material_id_materials', 'topics', type_='foreignkey')
    op.drop_constraint('fk_topics_user_id_users', 'topics', type_='foreignkey')
    op.drop_index(op.f('ix_topics_user_id'), table_name='topics')
    op.drop_index(op.f('ix_topics_source_type'), table_name='topics')
    op.drop_index(op.f('ix_topics_source_material_id'), table_name='topics')
    op.drop_column('topics', 'confidence_score')
    op.drop_column('topics', 'source_material_id')
    op.drop_column('topics', 'source_reference')
    op.drop_column('topics', 'source_type')
    op.drop_column('topics', 'user_id')
    op.drop_index(op.f('ix_tasks_source_type'), table_name='tasks')
    op.drop_column('tasks', 'confidence_score')
    op.drop_column('tasks', 'source_reference')
    op.drop_column('tasks', 'source_type')
    op.drop_column('study_spaces', 'source_language')
    op.drop_column('study_spaces', 'learning_language')
    op.drop_column('study_spaces', 'interface_language')
    op.drop_column('materials', 'source_language')
    source_type_enum = sa.Enum('USER_CREATED', 'SOURCE_EXTRACTED', 'AI_INFERRED', 'MIXED', name='source_type_enum')
    source_type_enum.drop(op.get_bind(), checkfirst=True)
