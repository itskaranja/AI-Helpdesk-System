from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel

from sqlalchemy.orm import Session

from app.db.databaase import SessionLocal
from app.db.models import User, Ticket ,TicketMessage
from app.tickets.schemas import MessageRequest
from app.auth.schemas import (LoginRequest,CreateUserRequest)

from app.auth.security import (
    hash_password,
    verify_password
)

from app.tickets.schemas import (
    TicketRequest,
    TicketUpdateRequest,
    ReassignTicketRequest, 
    TransferRequest
)
# Import RAG pipeline
from app.rag.query import ask_question


# ==========================================
# CREATE FASTAPI APP
# ==========================================
app = FastAPI()

# ==========================
# CORS SETUP (FIX FRONTEND CONNECTION)
# ==========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],)
# ==========================================
# DATABASE SESSION
# ==========================================
def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# ==========================================
# REQUEST MODEL FOR AI CHAT
# ==========================================
class QueryRequest(BaseModel):

    message: str


# ==========================================
# AUTO PRIORITY DETECTION
# ==========================================
def determine_priority(category):

    category = category.lower()

    # HIGH PRIORITY
    high_priority = [

        "account and access issues",

        "network",

        "security incidents"
    ]

    # MEDIUM PRIORITY
    medium_priority = [

        "software",

        "email communication issues",

        "service requests"
    ]

    # LOW PRIORITY
    low_priority = [

        "hardware",

        "compliance issues"
    ]

    # Determine priority
    if category in high_priority:

        return "high"

    elif category in medium_priority:

        return "medium"

    elif category in low_priority:

        return "low"

    # Default
    return "medium"


# ==========================================
# AUTO IT SUPPORT ASSIGNMENT
# ==========================================
def assign_it_support(category):

    category = category.lower()

    # ==========================================
    # BARRY OTIENO
    # ==========================================
    if category in [

        "network",

        "email communication issues"
    ]:

        return "botieno.itse@nairobibottlers.com"

    # ==========================================
    # PAUL NJATHA
    # ==========================================
    elif category in [

        "security incidents",

        "account and access issues",

        "compliance issues"
    ]:

        return "pnjatha.itse@nairobibottlers.com"

    # ==========================================
    # NICHOLUS MUKHOLI
    # ==========================================
    elif category in [

        "hardware",

        "software",

        "service requests"
    ]:

        return "nmukholi.itse@nairobibottlers.com"

    # ==========================================
    # DEFAULT FALLBACK
    # ==========================================
    return "botieno.itse@nairobibottlers.com"


# ==========================================
# ROOT ENDPOINT
# ==========================================
@app.get("/")
def home():

    return {
        "message": "AI Helpdesk API is running"
    }


# ==========================================
# RAG AI ENDPOINT
# ==========================================
@app.post("/ask")
def ask_ai(request: QueryRequest):

    """
    Receives user question
    Sends to RAG system
    Returns AI response
    """

    user_question = request.message

    answer = ask_question(user_question)

    return {
        "answer": answer
    }


# ==========================================
# LOGIN ENDPOINT
# ==========================================
@app.post("/login")
def login(
    request: LoginRequest,

    db:Session=Depends(get_db)
):

    # CHECK IF USER EXISTS

    user = db.query(User).filter(
        User.email == request.email
    ).first()

    # USER NOT FOUND

    if not user:

        return {

            "success": False,

            "message": "Employee account not found"
        }

    # VERIFY PASSWORD

    if not verify_password(
        request.password,
        user.password
    ):

        return {

            "success": False,

            "message": "Invalid password"
        }

    # LOGIN SUCCESS

    return {

        "success": True,

        "message": "Login successful",

        "role": user.role,

        "full_name": user.full_name,

        "email": user.email
    }


# ==========================================
# CREATE TICKET
# ==========================================
@app.post("/tickets")
def create_ticket(
    request: TicketRequest,
    db: Session = Depends(get_db)
):

    # AUTO DETECT PRIORITY
    priority = determine_priority(
        request.category
    )

    # AUTO ASSIGN IT SUPPORT
    assigned_it = assign_it_support(
        request.category
    )

    # ==========================================
    # CREATE NEW TICKET
    # ==========================================
    new_ticket = Ticket(

        title=request.title,

        description=request.description,

        category=request.category,

        priority=priority,

        status="open",

        user_email=request.user_email,

        assigned_to=assigned_it
    )

    db.add(new_ticket)

    db.commit()

    return {

        "success": True,

        "message": "Ticket created successfully",

        "priority": priority,

        "status": "open",

        "assigned_to": assigned_it
    }

@app.get("/debug-tickets")
def debug_tickets(
    db: Session = Depends(get_db)
):

    tickets = db.query(Ticket).all()

    result = []

    for t in tickets:

        result.append({

            "id": t.id,

            "title": t.title,

            "user_email": t.user_email,

            "assigned_to": t.assigned_to,

            "status": t.status
        })

    return result
# ==========================================
# GET ALL TICKETS
# ==========================================
@app.get("/tickets")
def get_tickets(
    db: Session = Depends(get_db)
):

    tickets = db.query(Ticket).all()


    return tickets


# ==========================================
# GET MY ASSIGNED TICKETS
# ==========================================
@app.get("/my-tickets/{it_email}")
def get_my_tickets(
    it_email: str,
    db: Session = Depends(get_db)
):

    tickets = db.query(Ticket).filter(
        Ticket.assigned_to == it_email
    ).all()

    print("FOUND:", len(tickets))

    return tickets

# ==========================
# UPDATE TICKET STATUS
# ==========================
@app.put("/tickets/update-status")
def update_ticket_status(
    request: TicketUpdateRequest,
    db: Session = Depends(get_db)
):
    # Check if IT support exists
    it_support = db.query(User).filter(
        User.email == request.it_email,
        User.role == "it_support"
    ).first()

    if not it_support:

        return {
            "success": False,
            "message": "Only IT support can update tickets"
        }

    # Find ticket
    ticket = db.query(Ticket).filter(
        Ticket.id == request.ticket_id
    ).first()

    if not ticket:

        return {
            "success": False,
            "message": "Ticket not found"
        }

    # Allowed statuses
    allowed_statuses = [

        "open",

        "in_progress",

        "resolved"
    ]

    # Validate status
    if request.status not in allowed_statuses:

        return {
            "success": False,
            "message": "Invalid status"
        }

    # Update ticket status
    ticket.status = request.status

    db.commit()

    return {

        "success": True,

        "message": "Ticket status updated successfully",

        "ticket_id": ticket.id,

        "new_status": ticket.status,

        "updated_by": request.it_email
    }

# ==========================
# REASSIGN TICKET
# ==========================
@app.put("/tickets/reassign")
def reassign_ticket(
    request: ReassignTicketRequest,
    db: Session = Depends(get_db)
):

    # ==========================
    # VERIFY CURRENT IT SUPPORT
    # ==========================
    current_it = db.query(User).filter(

        User.email == request.current_it_email,

        User.role == "it_support"

    ).first()

    if not current_it:

        return {

            "success": False,

            "message": "Only IT support can reassign tickets"
        }

    # ==========================
    # FIND TICKET
    # ==========================
    ticket = db.query(Ticket).filter(
        Ticket.id == request.ticket_id
    ).first()

    if not ticket:

        return {

            "success": False,

            "message": "Ticket not found"
        }

    # ==========================
    # VERIFY NEW IT SUPPORT
    # ==========================
    new_it_support = db.query(User).filter(

        User.email == request.new_it_support_email,

        User.role == "it_support"

    ).first()

    if not new_it_support:

        return {

            "success": False,

            "message": "New IT support engineer not found"
        }

    # ==========================
    # UPDATE ASSIGNMENT
    # ==========================
    ticket.assigned_to = request.new_it_support_email

    db.commit()

    return {

        "success": True,

        "message": "Ticket reassigned successfully",

        "ticket_id": ticket.id,

        "assigned_to": ticket.assigned_to,

        "reassigned_by": request.current_it_email
    }

# ==========================
# GET USER'S CREATED TICKETS
# ==========================
@app.get("/user-tickets/{user_email}")
def get_user_tickets(
    user_email: str,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.email == user_email
    ).first()

    if not user:

        return {

            "success": False,

            "message": "User not found"
        }

    tickets = db.query(Ticket).filter(
        Ticket.user_email == user_email
    ).all()

    return tickets
# ==========================
# IT DASHBOARD SUMMARY
# ==========================
@app.get("/dashboard/summary")
def dashboard_summary(
    db: Session = Depends(get_db)
):

    total_tickets = db.query(Ticket).count()

    open_tickets = db.query(Ticket).filter(
        Ticket.status == "open"
    ).count()

    in_progress_tickets = db.query(Ticket).filter(
        Ticket.status == "in_progress"
    ).count()

    resolved_tickets = db.query(Ticket).filter(
        Ticket.status == "resolved"
    ).count()

    high_priority_tickets = db.query(Ticket).filter(
        Ticket.priority == "high"
    ).count()


    return {

        "total_tickets": total_tickets,

        "open_tickets": open_tickets,

        "in_progress_tickets": in_progress_tickets,

        "resolved_tickets": resolved_tickets,

        "high_priority_tickets": high_priority_tickets
    }   

# ==========================
# SEND TICKET MESSAGE
# ==========================
@app.post("/tickets/message")
def send_message(
    request: MessageRequest,
    db: Session = Depends(get_db)
):

    # Check ticket exists
    ticket = db.query(Ticket).filter(
        Ticket.id == request.ticket_id
    ).first()

    if not ticket:

        return {
            "success": False,
            "message": "Ticket not found"
        }

    # Save message
    new_message = TicketMessage(

        ticket_id=request.ticket_id,

        sender_email=request.sender_email,

        message=request.message
    )

    db.add(new_message)

    db.commit()

    return {

        "success": True,

        "message": "Message sent successfully"
    }

# ==========================
# GET TICKET CHAT
# ==========================
@app.get("/tickets/messages/{ticket_id}")
def get_ticket_messages(
    ticket_id: int,
    db: Session = Depends(get_db)
):

    messages = db.query(TicketMessage).filter(
        TicketMessage.ticket_id == ticket_id
    ).all()

    return messages

# ==========================================
# REQUEST TICKET TRANSFER
# ==========================================
@app.put("/tickets/request-transfer")
def request_transfer(
    request: TransferRequest,
    db: Session = Depends(get_db)
):

    # Find ticket
    ticket = db.query(Ticket).filter(
        Ticket.id == request.ticket_id
    ).first()

    # Ticket not found
    if not ticket:


        return {
            "success": False,
            "message": "Ticket not found"
        }

    # Only assigned IT can request transfer
    if ticket.assigned_to != request.current_it_email:

       
        return {
            "success": False,
            "message": "You are not assigned to this ticket"
        }

    # Save transfer request
    ticket.transfer_requested_to = request.new_it_support_email

    ticket.transfer_status = "pending"

    db.commit()

    return {
        "success": True,
        "message": "Transfer request sent"
    }

# ==========================================
# ACCEPT TRANSFER REQUEST
# ==========================================
@app.put("/tickets/accept-transfer")
def accept_transfer(
    request: TransferRequest,
    db: Session = Depends(get_db)
):
    # Find ticket
    ticket = db.query(Ticket).filter(
        Ticket.id == request.ticket_id
    ).first()

    # Ticket not found
    if not ticket:

        return {
            "success": False,
            "message": "Ticket not found"
        }

    # Check request target
    if ticket.transfer_requested_to != request.current_it_email:

        return {
            "success": False,
            "message": "No transfer request for you"
        }

    # Accept transfer
    ticket.assigned_to = request.current_it_email

    ticket.transfer_status = "accepted"

    ticket.transfer_requested_to = None

    db.commit()

    db.close()

    return {
        "success": True,
        "message": "Transfer accepted"
    }

# ==========================================
# TICKETS CREATED OVER TIME
# ==========================================
@app.get("/analytics/tickets-over-time")
def tickets_over_time(
    db: Session = Depends(get_db)
):
    tickets = db.query(Ticket).all()

    result = {}

    for ticket in tickets:

        if ticket.created_at:

            date = ticket.created_at.strftime("%Y-%m-%d")

            result[date] = result.get(date, 0) + 1


    formatted = []

    for key, value in result.items():

        formatted.append({
            "date": key,
            "tickets": value
        })

    return formatted

# ==========================================
# WORKLOAD BALANCING ANALYTICS
# ==========================================
@app.get("/analytics/it-workload")
def it_workload(
    db: Session = Depends(get_db)
):

    tickets = db.query(Ticket).filter(
        Ticket.status == "resolved"
    ).all()

    result = {}

    for ticket in tickets:

        engineer = ticket.assigned_to or "Unassigned"

        result[engineer] = result.get(engineer, 0) + 1


    formatted = []

    for key, value in result.items():

        formatted.append({
            "engineer": key,
            "resolved": value
        })

    return formatted

# ==========================================
# MOST COMMON TICKET CATEGORIES
# ==========================================
@app.get("/analytics/ticket-categories")
def ticket_categories(
    db: Session = Depends(get_db)
):

    tickets = db.query(Ticket).all()

    result = {}

    for ticket in tickets:

        category = ticket.category or "Other"

        result[category] = result.get(category, 0) + 1


    formatted = []

    for key, value in result.items():

        formatted.append({
            "name": key,
            "value": value
        })

    return formatted

   # ==========================================
# CREATE NEW USER (ADMIN)
# ==========================================
@app.post("/create-user")
def create_user(
    user:CreateUserRequest,
    db: Session = Depends(get_db)
):

    # Check existing user
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:

        return {
            "success": False,
            "message": "User already exists"
        }

    # Create new user
    new_user = User(

        full_name=user.full_name,

        email=user.email,

        password=hash_password(user.password),

        role=user.role
    )

    db.add(new_user)

    db.commit()

    return {

        "success": True,

        "message": "User created successfully"
    }