import logging
import os

import pandas as pd
from django.apps import apps
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Chunks the fake employee dataset and embeds it into Pinecone for RAG queries."

    def __init__(self) -> None:
        """Initialize the command."""
        super().__init__()
        self.logger = logging.getLogger(__name__)

        self.rag_app_config = apps.get_app_config("rag")

        if not self.rag_app_config.rag_client:
            msg = "RAG client not initialized."
            raise CommandError(msg)

    def handle(self, *args, **kwargs) -> None:  # noqa: ARG002
        """Handle the command."""
        employee_data_path = f"{self.rag_app_config.path}/data/Fake_Employee_Data.xlsx"

        try:
            employee_data = pd.read_excel(employee_data_path, engine="openpyxl")
        except FileNotFoundError:
            msg = f"Dataset not found at {employee_data_path}."
            raise CommandError(msg) from None

        self.logger.info("Loaded dataset with %d rows.", len(employee_data))

        data_chunks = self.chunk_rows_into_text(employee_data)
        self.logger.info("Generated %d text chunks from the dataset.", len(data_chunks))

        self.embed_and_upsert(data_chunks)
        self.logger.info(
            "Dataset has been successfully embedded and upserted to Pinecone.",
        )

    def chunk_rows_into_text(self, df: pd.DataFrame) -> list:
        """Chunk rows into text with JSON metadata."""
        chunks = []
        for idx, row in df.iterrows():
            text = (
                f"Name: {row['Name']}, "
                f"Department: {row['Department']}, "
                f"Salary: {row['Salary']}"
            )
            chunks.append((str(idx), text))
        return chunks

    def embed_and_upsert(self, data_chunks: list) -> None:
        """Embed and upsert data chunks to Pinecone."""
        vectors_to_upsert = []
        for row_id, text_chunk in data_chunks:
            try:
                embedding = self.rag_app_config.rag_client.openai.generate_embedding(
                    text_chunk,
                    model=os.getenv("EMBEDDING_MODEL"),
                )
                metadata = {"original_text": text_chunk}
                vectors_to_upsert.append((f"row-{row_id}", embedding, metadata))
            except Exception as e:
                self.logger.exception("Skipping row %s due to error: %s", row_id, str(e))

        if vectors_to_upsert:
            self.rag_app_config.rag_client.pinecone.upsert_vectors(vectors_to_upsert)
