import pytest
from fastapi import HTTPException
from app.services.document_processor import document_processor
from app.core.config import settings

def test_validate_file_happy_path():
    assert document_processor.validate_file("test.pdf", "application/pdf", 100) == "PDF"
    assert document_processor.validate_file("test.txt", "text/plain", 100) == "TXT"
    assert document_processor.validate_file("test.md", "text/markdown", 100) == "MARKDOWN"
    assert document_processor.validate_file("test.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 100) == "DOCX"
    assert document_processor.validate_file("test.json", "application/json", 100) == "JSON"

def test_validate_file_invalid_extension():
    with pytest.raises(HTTPException) as exc_info:
        document_processor.validate_file("test.exe", "application/x-msdownload", 100)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "File extension .exe not allowed"

def test_validate_file_exceeds_size():
    with pytest.raises(HTTPException) as exc_info:
        document_processor.validate_file("test.pdf", "application/pdf", settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024 + 1)
    assert exc_info.value.status_code == 400
    assert exc_info.value.detail == "File exceeds maximum allowed size (10MB)"
