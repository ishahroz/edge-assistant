import os

from openai import OpenAI


def get_openai_client() -> OpenAI:
    """Initialize and return the OpenAI client with API key."""
    return OpenAI(api_key=os.environ["OPENAI_API_KEY"])


def get_openai_stream_response(
    system_prompt: str,
    user_query: str,
    model: str = "gpt-4o",
    max_tokens: int = 100,
) -> str:
    """Base function for streaming responses from OpenAI."""
    client = get_openai_client()

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_query},
        ],
        max_tokens=max_tokens,
        stream=True,
    )

    for chunk in response:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
