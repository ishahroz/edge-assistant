from django.core.management.base import BaseCommand
import os
from dotenv import load_dotenv
import pandas as pd
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec


class Command(BaseCommand):
    help = "Chunks the dataset and embeds it into Pinecone for RAG queries."

    def __init__(self):
        super().__init__()

        # Load environment variables from .env file
        dotenv_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env")
        load_dotenv(dotenv_path)

        # Initialize OpenAI client here
        OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

        if not OPENAI_API_KEY:
            self.stdout.write(
                self.style.ERROR("OPENAI_API_KEY is not set in the environment.")
            )
            exit(1)

        self.openai_client = OpenAI(api_key=OPENAI_API_KEY)

    def handle(self, *args, **kwargs):
        # Step 1: Environment variables check
        PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
        INDEX_NAME = os.getenv("PINECONE_INDEX_NAME")

        if not PINECONE_API_KEY:
            self.stdout.write(
                self.style.ERROR("PINECONE_API_KEY is not set in the environment.")
            )
            return

        # Step 2: Load Dataset
        excel_file_path = os.path.join(
            os.path.dirname(__file__), "..", "..", "data", "Fake_Employee_Data.xlsx"
        )

        try:
            df = pd.read_excel(excel_file_path, engine="openpyxl")
        except FileNotFoundError:
            self.stdout.write(
                self.style.ERROR(f"Dataset not found at {excel_file_path}.")
            )
            return

        self.stdout.write(f"Loaded dataset with {len(df)} rows.")

        # Step 3: Chunking the data
        data_chunks = self.chunk_rows_into_text(df)
        self.stdout.write(f"Generated {len(data_chunks)} text chunks from the dataset.")

        # Step 4: Initialize Pinecone
        pinecone = Pinecone(api_key=PINECONE_API_KEY)

        if INDEX_NAME not in pinecone.list_indexes():
            pinecone.create_index(
                name=INDEX_NAME,
                dimension=1536,
                spec=ServerlessSpec(cloud="aws", region="us-east-1"),
            )  # 1536 for text-embedding-3-small
            self.stdout.write(
                self.style.SUCCESS(f"Pinecone index '{INDEX_NAME}' created.")
            )
        else:
            self.stdout.write(f"Using existing Pinecone index '{INDEX_NAME}'.")

        index = pinecone.Index(INDEX_NAME)

        # Step 5: Embedding and Upserting
        self.embed_and_upsert(data_chunks, index)

        self.stdout.write(
            self.style.SUCCESS(
                "Dataset has been successfully embedded and upserted to Pinecone."
            )
        )

    def chunk_rows_into_text(self, df):
        """
        Converts each row of the DataFrame into a text chunk for embedding.
        """
        chunks = []
        for idx, row in df.iterrows():
            text = f"Name: {row['Name']}, Department: {row['Department']}, Salary: {row['Salary']}"
            chunks.append((idx, text))
        return chunks

    def get_embedding(self, text):
        """
        Generates an embedding for the given text using OpenAI.
        """
        try:
            response = self.openai_client.embeddings.create(
                model="text-embedding-3-small", input=text
            )
            return response.data[0].embedding
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error generating embedding: {e}"))
            return None

    def embed_and_upsert(self, data_chunks, index):
        """
        Embeds each text chunk and uploads it to Pinecone.
        """
        batch_size = 50
        vectors_to_upsert = []

        for i, (row_id, text_chunk) in enumerate(data_chunks):
            embedding_vector = self.get_embedding(text_chunk)
            if embedding_vector is None:
                continue

            metadata = {"original_text": text_chunk}
            doc_id = f"row-{row_id}"

            vectors_to_upsert.append((doc_id, embedding_vector, metadata))

            # Batch upsert every 'batch_size' items
            if (i + 1) % batch_size == 0:
                index.upsert(vectors=vectors_to_upsert)
                self.stdout.write(f"Upserted {i + 1} embeddings so far...")
                vectors_to_upsert.clear()

        # Upsert any remaining vectors
        if vectors_to_upsert:
            index.upsert(vectors=vectors_to_upsert)
            self.stdout.write(f"Upserted final {len(vectors_to_upsert)} embeddings.")
