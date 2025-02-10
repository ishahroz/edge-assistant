from celery import shared_task
from django.apps import apps


@shared_task
def fetch_rag_context(query: str, top_k: int = 3) -> str:
    """Celery task to fetch RAG context from vector store."""
    rag_client = apps.get_app_config("rag").rag_client
    return rag_client.get_context_from_pinecone(query, top_k)
