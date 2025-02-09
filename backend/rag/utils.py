from pinecone import Pinecone


def get_context_from_pinecone(query, top_k=3):
    """Retrieve relevant context from Pinecone vector store"""
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index = pc.Index(os.getenv("PINECONE_INDEX_NAME"))

    # Get embedding for query
    embedding = get_embedding(query)

    # Query Pinecone
    results = index.query(vector=embedding, top_k=top_k, include_metadata=True)

    return " ".join([match.metadata["original_text"] for match in results.matches])
