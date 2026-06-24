import os

# Updated imports (new LangChain structure)
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma

from .embeddings import get_embedding_model

DATA_PATH = "data/"
CHROMA_PATH = "chroma_db/"


def load_documents():
    documents = []

    for file in os.listdir(DATA_PATH):
        path = os.path.join(DATA_PATH, file)

        if file.endswith(".pdf"):
            loader = PyPDFLoader(path)
            documents.extend(loader.load())

        elif file.endswith(".txt"):
            loader = TextLoader(path, encoding="utf-8")
            documents.extend(loader.load())

    return documents


def split_documents(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    return splitter.split_documents(documents)


def main():
    print("Loading documents...")
    docs = load_documents()

    print("Splitting documents...")
    chunks = split_documents(docs)

    print("Creating embeddings...")
    embedding = get_embedding_model()

    db = Chroma.from_documents(
        chunks,
        embedding,
        persist_directory=CHROMA_PATH
    )

    db.persist()
    print("✅ Embeddings stored successfully.")


if __name__ == "__main__":
    main()