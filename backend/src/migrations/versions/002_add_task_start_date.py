"""add_task_start_date

Revision ID: 002
Revises: 001
Create Date: 2026-01-12 00:00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add start_date column to tasks table (nullable for backward compatibility)
    op.add_column('tasks', sa.Column('start_date', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # Drop start_date column from tasks table
    op.drop_column('tasks', 'start_date')
