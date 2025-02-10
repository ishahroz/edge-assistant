from django.urls import path

from .views import ChatHistoryListCreate, stream_llm_response_view

urlpatterns = [
    path("list/", ChatHistoryListCreate.as_view(), name="chat-list"),
    path("stream/", stream_llm_response_view, name="stream_llm_response_view"),
]
