import time

from celery.result import AsyncResult
from django.apps import apps
from django.http import HttpRequest, StreamingHttpResponse
from rest_framework import generics

from chat.models import ChatHistory
from chat.serializers import ChatHistorySerializer
from rag.tasks import fetch_rag_context


class ChatHistoryListCreate(generics.ListCreateAPIView):
    queryset = ChatHistory.objects.all().order_by("-created_at")
    serializer_class = ChatHistorySerializer


def stream_llm_response_view(request: HttpRequest) -> StreamingHttpResponse:
    """Stream LLM response using Celery + RAG and Server-Side Events (SSE)."""
    query = request.GET.get("query", "")
    if not query:
        return StreamingHttpResponse(status=400)

    rag_app_config = apps.get_app_config("rag")

    # Create chat history entry
    title = " ".join(query.split()[:5])
    ChatHistory.objects.create(title=title)

    fetch_rag_context_task = fetch_rag_context.delay(query)

    def event_stream() -> str:
        result = AsyncResult(fetch_rag_context_task.id)
        while not result.ready():
            yield "event: status\ndata: Retrieving relevant context...\n\n"
            time.sleep(0.5)

        # Stream LLM response once context is ready
        try:
            for token in rag_app_config.rag_client.stream_rag_response(
                query,
                result.result,
            ):
                yield f"data: {token}\n\n"
                time.sleep(0.05)
        finally:
            yield "data: [DONE]\n\n"

    return StreamingHttpResponse(event_stream(), content_type="text/event-stream")
