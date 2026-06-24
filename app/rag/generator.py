# Import Gemini API
import google.generativeai as genai
from dotenv import load_dotenv
import os

# Configure API key 
load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)
# Load Gemini model
model = genai.GenerativeModel("gemini-2.5-flash")


def generate_answer(question, docs):
    """
    This function generates a final answer using:
    - Retrieved documents (context)
    - Gemini model
    """

    # Combine retrieved documents into one context string
    context = "\n\n".join([doc.page_content for doc in docs])

    # Create prompt (VERY IMPORTANT for answer quality)
    prompt = f"""
    You are an IT support assistant for Nairobi Bottlers.

    Use the context as your primary source.
    You may also use your general knowledge to explain clearly.

    Always give a helpful, natural, and professional answer.

    Context:
    {context}

    Question:
    {question}
    """

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception:
        
        if context:
            return f"Based on available information:\n\n{context[:500]}..."

        return "I'm here to help! Could you clarify your issue?"
