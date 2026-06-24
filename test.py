# Import main query function
from app.rag.query import ask_question

# Infinite loop for testing interaction
while True:
    # Get user input
    q = input("You: ")

    # Get AI response
    response = ask_question(q)

    # Print response
    print("Bot:", response)