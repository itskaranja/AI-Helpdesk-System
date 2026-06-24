# Import retriever (for fetching relevant docs)
from app.rag.retriever import get_relevant_docs
# Import generator (for AI answer)
from .generator import generate_answer


def ask_question(question):
    """
    Main pipeline:
    1. Retrieve relevant documents
    2. Generate answer using Gemini
    """

    # Step 1: Retrieve context
    docs = get_relevant_docs(question)

    # Step 2: Generate final answer
    answer = generate_answer(question, docs)

    return answer