from celery import shared_task

from .utils import get_context_from_pinecone


@shared_task
def fetch_rag_context(query: str, top_k: int = 3) -> str:
    """Celery task to fetch RAG context from vector store."""
    return get_context_from_pinecone(query, top_k)
