from django.urls import path

from .views import (
    ChatHistoryCreate,
    ChatHistoryListCreate,
    ChatMessageList,
    stream_llm_response_view,
)

urlpatterns = [
    path("histories/", ChatHistoryListCreate.as_view(), name="chat-list"),
    path("histories/create/", ChatHistoryCreate.as_view(), name="chat-create"),
    path("stream/", stream_llm_response_view, name="stream_llm_response_view"),
    path(
        "histories/<int:pk>/messages/",
        ChatMessageList.as_view(),
        name="chat-messages",
    ),
]
