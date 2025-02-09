import time

from django.http import HttpRequest, StreamingHttpResponse

from .llm_streamer import stream_rag_response
from .utils import get_context_from_pinecone


def sse_llm_view(request: HttpRequest) -> StreamingHttpResponse:
    """Stream LLM response tokens using OpenAI."""
    query = request.GET.get("query", "")
    # context = get_context_from_pinecone(query)
    context = "You are a helpful assistant."

    def event_stream() -> str:
        try:
            for token in stream_rag_response(query, context):
                yield f"data: {token}\n\n"
                time.sleep(0.05)  # optional delay for smooth streaming
        finally:
            # Send completion signal
            yield "data: [DONE]\n\n"

    return StreamingHttpResponse(event_stream(), content_type="text/event-stream")
