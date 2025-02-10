import os

from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec


class BaseClient:
    """Base class for API clients."""

    def __init__(self, api_key: str | None = None, env_key: str | None = None) -> None:
        """Initialize client with either provided API key or environment variable.

        Args:
            api_key: Direct API key input
            env_key: Environment variable name to check

        """
        self.api_key = api_key or os.getenv(env_key)
        if not self.api_key:
            msg = f"{env_key} must be set in environment or passed directly."
            raise ValueError(msg)


class OpenAIClient(BaseClient):
    """Interal OpenAI client."""

    def __init__(self, api_key: str | None = None) -> None:
        """Initialize OpenAI client with API key."""
        super().__init__(api_key=api_key, env_key="OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key)

    def generate_embedding(
        self,
        text: str,
        model: str | None = None,
    ) -> list[float]:
        """Generate text embedding using specified model."""
        model_name = model or os.getenv("EMBEDDING_MODEL")
        if not model_name:
            msg = "EMBEDDING_MODEL must be set in environment or passed directly."
            raise ValueError(msg)
        response = self.client.embeddings.create(input=text, model=model_name)
        return response.data[0].embedding

    def stream_chat_completion(
        self,
        system_prompt: str,
        user_query: str,
        model: str | None = None,
        max_tokens: int = 100,
    ) -> iter:
        """Stream chat completion response using specified model."""
        model_name = model or os.getenv("CHAT_MODEL")
        if not model_name:
            msg = "CHAT_MODEL must be set in environment or passed directly."
            raise ValueError(msg)
        response = self.client.chat.completions.create(
            model=model_name,
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


class PineconeClient(BaseClient):
    """Internal Pinecone vector database client."""

    def __init__(self, api_key: str | None = None, index_name: str | None = None) -> None:
        """Initialize Pinecone client with API key and index name."""
        super().__init__(api_key=api_key, env_key="PINECONE_API_KEY")
        self.index_name = index_name or os.getenv("PINECONE_INDEX_NAME")
        if not self.index_name:
            msg = "PINECONE_INDEX_NAME must be set in environment or passed directly."
            raise ValueError(msg)

        self.client = Pinecone(api_key=self.api_key)
        self._initialize_index()

    def _initialize_index(self, dimension: int | None = None) -> None:
        """Initialize Pinecone index with specified dimension."""
        dimension = dimension or int(os.getenv("PINECONE_INDEX_DIMS"))
        if not dimension:
            msg = "PINECONE_INDEX_DIMS must be set in environment or passed directly."
            raise ValueError(msg)
        if self.index_name not in self.client.list_indexes().names():
            self.client.create_index(
                name=self.index_name,
                dimension=dimension,
                spec=ServerlessSpec(cloud="aws", region="us-east-1"),
            )
        self.index = self.client.Index(self.index_name)

    def query_index(self, vector: list[float], top_k: int = 3) -> list:
        """Query the vector index."""
        return self.index.query(vector=vector, top_k=top_k, include_metadata=True).matches

    def upsert_vectors(self, vectors: list) -> dict:
        """Upsert vectors into the index."""
        return self.index.upsert(vectors=vectors)


class RAGClient:
    """Internal RAG client."""

    def __init__(self) -> None:
        """Initialize RAG client with OpenAI and Pinecone clients."""
        self.openai = OpenAIClient()
        self.pinecone = PineconeClient()

    def get_context_from_pinecone(self, query: str, top_k: int = 3) -> str:
        """Retrieve relevant context from Pinecone."""
        embedding = self.openai.generate_embedding(query)
        results = self.pinecone.query_index(embedding, top_k=top_k)
        return " ".join([match.metadata["original_text"] for match in results])

    def stream_rag_response(self, query: str, context: str) -> iter:
        """Stream RAG-formatted response using OpenAI."""
        system_prompt = f"You are a helpful assistant. Context: {context}"
        return self.openai.stream_chat_completion(
            system_prompt=system_prompt,
            user_query=query,
        )
