import pytest
import hashlib
from app.services.document_processor import (
    sanitize_filename,
    compute_sha256,
    DocumentProcessor
)
from app.core.config import settings

def test_sanitize_filename_happy_path():
    assert sanitize_filename("test_file.pdf") == "test_file.pdf"

def test_sanitize_filename_special_chars():
    # `os.path.basename` will remove directory parts
    assert sanitize_filename("../../../etc/passwd") == "passwd"
    # Spaces and special chars should be replaced by underscores
    assert sanitize_filename("My Document 2024.docx") == "My_Document_2024.docx"
    assert sanitize_filename("file_with@spec!al#chars$.txt") == "file_with_spec_al_chars_.txt"

def test_sanitize_filename_empty():
    # If the resulting filename is empty, it should generate a random one
    result = sanitize_filename("")
    assert result.startswith("upload_")
    assert len(result) == 7 + 8  # "upload_" + 8 hex chars = 15

    result2 = sanitize_filename("!@#$")
    assert result2 == "____"  # re.sub replaces each invalid char with '_'

def test_compute_sha256():
    test_bytes = b"Hello, world!"
    expected_hash = hashlib.sha256(test_bytes).hexdigest()
    assert compute_sha256(test_bytes) == expected_hash

@pytest.fixture
def doc_processor(tmp_path):
    # Use tmp_path to prevent creating real directories in the project
    return DocumentProcessor(upload_dir=str(tmp_path / "uploads"))

def test_validate_file_happy_paths(doc_processor):
    assert doc_processor.validate_file("document.pdf", "application/pdf", 1024) == "PDF"
    assert doc_processor.validate_file("text.txt", "text/plain", 1024) == "TXT"
    assert doc_processor.validate_file("readme.md", "text/markdown", 1024) == "MARKDOWN"
    assert doc_processor.validate_file("word.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 1024) == "DOCX"
    assert doc_processor.validate_file("data.json", "application/json", 1024) == "JSON"

    # Case insensitive extension check
    assert doc_processor.validate_file("upper.PDF", "application/pdf", 1024) == "PDF"

def test_validate_file_invalid_extension(doc_processor):
    with pytest.raises(ValueError, match="File extension '.jpg' is not supported"):
        doc_processor.validate_file("image.jpg", "image/jpeg", 1024)

    with pytest.raises(ValueError, match="is not supported"):
        doc_processor.validate_file("no_extension_file", None, 1024)

def test_validate_file_size_exceeded(doc_processor):
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    too_large = max_bytes + 1

    with pytest.raises(ValueError, match=f"exceeds limit of {settings.MAX_UPLOAD_SIZE_MB}MB"):
        doc_processor.validate_file("document.pdf", "application/pdf", too_large)
