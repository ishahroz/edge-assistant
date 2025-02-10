from django.db import models
from django.utils import timezone


class ChatHistory(models.Model):
    title = models.CharField(max_length=200)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        """Return a string representation of the chat history."""
        return self.title

    @property
    def derived_title(self) -> str:
        """Derived title from first message if empty."""
        if self.title:
            return self.title
        if self.messages.exists():
            first_user_message = self.messages.filter(role=ChatMessage.Role.USER).first()
            if first_user_message:
                return first_user_message.content[:50] + "..."
        return "New Chat"


class ChatMessage(models.Model):
    class Role(models.TextChoices):
        USER = "user", "User Message"
        BOT = "bot", "LLM Response"

    chat_history = models.ForeignKey(
        ChatHistory,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    role = models.CharField(max_length=10, choices=Role.choices)
    content = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self) -> str:
        """Return a string representation of the chat message."""
        return f"{self.role}: {self.content[:50]}..."
