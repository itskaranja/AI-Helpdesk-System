from sqlalchemy import Column, Integer, String, ForeignKey,DateTime
from app.db.databaase import Base
from sqlalchemy.sql import func
from app.auth.schemas import (
    LoginRequest,
    CreateUserRequest
)
# ==========================
# USER TABLE
# ==========================
class User(Base):

    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)

    # Full name
    full_name = Column(String(255))

    # Company email
    email = Column(String(255), unique=True, index=True)

    # Password
    password = Column(String(255))

    # employee or it_support
    role = Column(String(50))

    # Network / Hardware / Security
    specialization = Column(String(100), nullable=True)



# ==========================
# TICKETS TABLE
# ==========================
class Ticket(Base):

    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)

    # Ticket title
    title = Column(String(255))

    # Detailed issue
    description = Column(String(2000))

    # software/network/hardware
    category = Column(String(100))

    # low/medium/high
    priority = Column(String(50))

    # open/in_progress/resolved
    status = Column(String(50))

    # Employee who created ticket
    user_email = Column(String(255))

    # Assigned IT support engineer
    assigned_to = Column(String(255), nullable=True)

    transfer_requested_to = Column(String(255), nullable=True)

    transfer_status = Column(String(50), nullable=True)

    created_at = Column(
    DateTime(timezone=True),
    server_default=func.now()
)
# ==========================
# TICKET CHAT MESSAGES
# ==========================
class TicketMessage(Base):

    __tablename__ = "ticket_messages"

    id = Column(Integer, primary_key=True, index=True)

    # Related ticket
    ticket_id = Column(Integer)

    # Who sent message
    sender_email = Column(String(255))

    # Message content
    message = Column(String(5000))