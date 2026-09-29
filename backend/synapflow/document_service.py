import os
import uuid
from pathlib import Path


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


class DocumentService:

    ALLOWED_EXTENSIONS = {
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png"
    }

    @staticmethod
    def save_document(file_name: str, file_content: bytes) -> dict:

        extension = Path(file_name).suffix.lower()

        if extension not in DocumentService.ALLOWED_EXTENSIONS:
            raise ValueError(
                "Unsupported document type. "
                "Use PDF, JPG, JPEG or PNG."
            )

        document_id = "DOC-" + uuid.uuid4().hex[:8].upper()

        stored_name = document_id + extension
        file_path = UPLOAD_DIR / stored_name

        with open(file_path, "wb") as f:
            f.write(file_content)

        return {
            "document_id": document_id,
            "original_name": file_name,
            "stored_name": stored_name,
            "path": str(file_path),
            "status": "UPLOADED"
        }