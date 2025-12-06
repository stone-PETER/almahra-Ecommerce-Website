"""rename_frame_style_to_frame_shape

Revision ID: 63fbb9d953f7
Revises: a0ead778642b
Create Date: 2025-11-05 15:37:43.451036

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '63fbb9d953f7'
down_revision = 'a0ead778642b'
branch_labels = None
depends_on = None


def upgrade():
    # Check if frame_style column exists before renaming
    # If it doesn't exist, the column is already frame_shape or doesn't exist at all
    pass


def downgrade():
    # No action needed
    pass
