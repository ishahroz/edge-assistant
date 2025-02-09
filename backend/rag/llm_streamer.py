from .clients import get_openai_stream_response


def stream_rag_response(query: str, context: str) -> str:
    """Stream RAG-formatted response using OpenAI."""
    system_prompt = f"You are a helpful assistant. Context: {context}"
    return get_openai_stream_response(
        system_prompt=system_prompt,
        user_query=query,
        model="gpt-4o",
        max_tokens=100,
    )
