"""add_category_and_update_task_fields

Revision ID: 001
Revises:
Create Date: 2026-01-09 22:17:39

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create category table
    op.create_table(
        'category',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_category_name'), 'category', ['name'], unique=True)
    op.create_index(op.f('ix_category_user_id'), 'category', ['user_id'], unique=False)

    # Add new columns to tasks table
    op.add_column('tasks', sa.Column('title', sqlmodel.sql.sqltypes.AutoString(), nullable=False, server_default=''))
    op.add_column('tasks', sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('tasks', sa.Column('due_date', sa.DateTime(), nullable=True))
    op.add_column('tasks', sa.Column('category_id', sa.Integer(), nullable=True))

    # Create foreign key constraint for category_id
    op.create_foreign_key('fk_tasks_category_id', 'tasks', 'category', ['category_id'], ['id'])
    op.create_index(op.f('ix_tasks_category_id'), 'tasks', ['category_id'], unique=False)


def downgrade() -> None:
    # Drop foreign key and index for category_id
    op.drop_index(op.f('ix_tasks_category_id'), table_name='tasks')
    op.drop_constraint('fk_tasks_category_id', 'tasks', type_='foreignkey')

    # Drop new columns from tasks table
    op.drop_column('tasks', 'category_id')
    op.drop_column('tasks', 'due_date')
    op.drop_column('tasks', 'description')
    op.drop_column('tasks', 'title')

    # Drop category table
    op.drop_index(op.f('ix_category_user_id'), table_name='category')
    op.drop_index(op.f('ix_category_name'), table_name='category')
    op.drop_table('category')
