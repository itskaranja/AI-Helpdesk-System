from langchain_community.vectorstores import Chroma
from .embeddings import get_embedding_model

CHROMA_PATH = "chroma_db/"

# Load ONCE
embedding = get_embedding_model()

# Load DB ONCE
db = Chroma(
    persist_directory=CHROMA_PATH,
    embedding_function=embedding
)

# Create retriever ONCE
retriever = db.as_retriever(search_kwargs={"k": 3})


def get_relevant_docs(query):

    docs = retriever.invoke(query)

    return docs