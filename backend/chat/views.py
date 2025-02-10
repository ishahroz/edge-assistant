import time

from celery.result import AsyncResult
from django.apps import apps
from django.http import HttpRequest, StreamingHttpResponse
from rest_framework import generics
from rest_framework.response import Response

from chat.models import ChatHistory, ChatMessage
from chat.serializers import ChatHistorySerializer, ChatMessageSerializer
from rag.tasks import fetch_rag_context


class ChatHistoryListCreate(generics.ListCreateAPIView):
    queryset = ChatHistory.objects.all().order_by("-created_at")
    serializer_class = ChatHistorySerializer


class ChatHistoryCreate(generics.CreateAPIView):
    queryset = ChatHistory.objects.all()
    serializer_class = ChatHistorySerializer

    def perform_create(self, serializer: ChatHistorySerializer) -> None:
        """Create chat history and save it."""
        title = self.request.data.get("title", "")
        serializer.save(title=title)


class ChatMessageList(generics.RetrieveAPIView):
    serializer_class = ChatMessageSerializer
    queryset = ChatHistory.objects.all()

    def retrieve(self, request: HttpRequest, *args, **kwargs) -> Response:  # noqa: ARG002
        """Retrieve chat messages."""
        instance = self.get_object()
        messages = instance.messages.order_by("created_at")
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)


def stream_llm_response_view(request: HttpRequest) -> StreamingHttpResponse:
    """Stream LLM response using Celery + RAG and Server-Side Events (SSE)."""
    query = request.GET.get("query", "")
    chat_history_id = request.GET.get("chat_history_id")

    if not query or not chat_history_id:
        return StreamingHttpResponse(status=400)

    try:
        chat_history = ChatHistory.objects.get(id=chat_history_id)
    except ChatHistory.DoesNotExist:
        return StreamingHttpResponse(status=404)

    # Save user message
    ChatMessage.objects.create(
        chat_history=chat_history,
        role=ChatMessage.Role.USER,
        content=query,
    )

    rag_app_config = apps.get_app_config("rag")
    fetch_rag_context_task = fetch_rag_context.delay(query)

    def event_stream() -> str:
        result = AsyncResult(fetch_rag_context_task.id)
        full_response = []

        while not result.ready():
            yield "event: status\ndata: Retrieving relevant context...\n\n"
            time.sleep(0.5)

        try:
            for token in rag_app_config.rag_client.stream_rag_response(
                query,
                result.result,
            ):
                full_response.append(token)
                yield f"data: {token}\n\n"
                time.sleep(0.05)
        finally:
            # Save bot response
            ChatMessage.objects.create(
                chat_history=chat_history,
                role=ChatMessage.Role.BOT,
                content="".join(full_response),
            )

            # Update title if empty
            if not chat_history.title:
                chat_history.title = chat_history.derived_title
                chat_history.save()

            yield "data: [DONE]\n\n"

    return StreamingHttpResponse(event_stream(), content_type="text/event-stream")
