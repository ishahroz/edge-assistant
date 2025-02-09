import time

from celery.result import AsyncResult
from django.http import HttpRequest, StreamingHttpResponse
from rest_framework import generics

from rag.llm_streamer import stream_rag_response
from rag.tasks import fetch_rag_context

from .models import ChatHistory
from .serializers import ChatHistorySerializer


class ChatHistoryListCreate(generics.ListCreateAPIView):
    queryset = ChatHistory.objects.all().order_by("-created_at")
    serializer_class = ChatHistorySerializer


def sse_llm_view(request: HttpRequest) -> StreamingHttpResponse:
    """Stream LLM response using Celery+RAG and SSE."""
    query = request.GET.get("query", "")

    # Create chat history entry
    title = " ".join(query.split()[:5]) + "..." if query else "New Chat"
    chat = ChatHistory.objects.create(title=title)

    task = fetch_rag_context.delay(query)

    def event_stream():
        # Poll for context readiness
        result = AsyncResult(task.id)
        while not result.ready():
            yield "event: status\ndata: Retrieving relevant context...\n\n"
            time.sleep(0.5)

        # Stream LLM response once context is ready
        try:
            for token in stream_rag_response(query, result.result):
                yield f"data: {token}\n\n"
                time.sleep(0.05)
        finally:
            yield "data: [DONE]\n\n"

    return StreamingHttpResponse(event_stream(), content_type="text/event-stream")
