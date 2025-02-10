from django.apps import AppConfig

from rag.clients import RAGClient


class RagConfig(AppConfig):
    name = "rag"

    def __init__(self, app_name: str, app_module: str) -> None:
        """Initialize the app config."""
        super().__init__(app_name, app_module)
        self.rag_client = None

    def ready(self) -> None:
        """Perform initializations when the app is ready."""
        if not self.rag_client:
            self.rag_client = RAGClient()
