# chat/models.py
from django.conf import settings
from django.db import models

class ChatRoom(models.Model):
    """Represents a chat room that could be private (one-to-one) or a group."""
    name = models.CharField(max_length=100, blank=True, null=True)
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="chat_rooms")
    is_private = models.BooleanField(default=False)

    def __str__(self):
        if self.is_private and self.participants.count() == 2:
            participant_names = ", ".join([user.username for user in self.participants.all()])
            return f"Private Chat: {participant_names}"
        return self.name or "Group Chat"

class Message(models.Model):
    """Represents a message sent in a chat room."""
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="messages")
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name="messages")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username}: {self.content[:20]}"

