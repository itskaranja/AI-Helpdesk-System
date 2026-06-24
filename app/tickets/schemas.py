from pydantic import BaseModel
from typing import Optional  

class TicketUpdateRequest(BaseModel):

    ticket_id: int

    status: str

    it_email: str

# Create new ticket

from pydantic import BaseModel



# CREATE TICKET REQUEST

class TicketRequest(BaseModel):

    title: str

    description: str

    category: str

    user_email: str


# REASSIGN TICKET REQUEST

class ReassignTicketRequest(BaseModel):

    ticket_id: int

    new_it_support_email: str

    current_it_email: str 


# SEND CHAT MESSAGE

class MessageRequest(BaseModel):

    ticket_id: int

    sender_email: str

    message: str


# TRANSFER REQUEST

class TransferRequest(BaseModel):

    ticket_id: int

    current_it_email: str

    new_it_support_email: str