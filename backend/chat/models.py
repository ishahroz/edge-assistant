from django.db import models
from django.utils import timezone


class ChatHistory(models.Model):
    title = models.CharField(max_length=200)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        """Return a string representation of the chat history."""
        return self.title
