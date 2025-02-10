from rest_framework import serializers

from .models import ChatHistory, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")

    class Meta:
        model = ChatMessage
        fields = ["role", "content", "created_at"]
        read_only_fields = ["role", "content", "created_at"]


class ChatHistorySerializer(serializers.ModelSerializer):
    title = serializers.CharField(source="derived_title", read_only=True)

    class Meta:
        model = ChatHistory
        fields = ["id", "title", "created_at"]
