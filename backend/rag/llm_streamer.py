import os

from openai import OpenAI


def stream_rag_response(query: str, context: str) -> str:
    """Stream LLM response tokens using OpenAI."""
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant. Context: " + context,
            },
            {"role": "user", "content": query},
        ],
        max_tokens=100,
        stream=True,
    )

    for chunk in response:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
