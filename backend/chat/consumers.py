"""Consumers for Chat application."""

import json

from channels.generic.websocket import AsyncWebsocketConsumer
from openai import OpenAI


class ChatConsumer(AsyncWebsocketConsumer):
    """Chat consumer."""

    async def connect(self) -> None:
        """Connect to the WebSocket."""
        # Async call to accept the WebSocket connection
        await self.accept()

    async def disconnect(self, close_code) -> None:
        """Disconnect from the WebSocket."""
        pass

    async def receive(self, text_data=None, bytes_data=None):
        """Receive data from the WebSocket."""
        await self.stream_llm_response(text_data)

    async def stream_llm_response(self, query: str):
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "developer", "content": "You are a helpful assistant."},
                {
                    "role": "user",
                    "content": query,
                },
            ],
            max_tokens=100,
            stream=True,
        )

        for chunk in response:
            if chunk.choices[0].delta.content is not None:
                partial_text = chunk.choices[0].delta.content
                await self.send(
                    json.dumps({"type": "chat_message", "message": partial_text}),
                )
