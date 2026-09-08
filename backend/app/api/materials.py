import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.study_space import StudySpace
from app.models.material import Material
from app.schemas.material import MaterialResponse, MaterialDetailResponse
from app.services.document_processor import document_processor
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/upload", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
async def upload_material(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    study_space_id: Optional[uuid.UUID] = Form(None),
    source_language: Optional[str] = Form("en"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload and process a document (PDF, TXT, MD, DOCX):
    1. Validates extension, mime type, and file size.
    2. Computes SHA-256 checksum to prevent corrupt or duplicate uploads.
    3. Saves securely to disk.
    4. Extracts text and page counts using pypdf.
    5. Creates Material record linked to user and study space.
    """
    file_bytes = await file.read()
    size_bytes = len(file_bytes)

    # Validate
    try:
        category = document_processor.validate_file(file.filename, file.content_type, size_bytes)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # Resolve StudySpace
    if study_space_id:
        space = db.query(StudySpace).filter(StudySpace.id == study_space_id, StudySpace.user_id == current_user.id).first()
        if not space:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="StudySpace not found.")
    else:
        # Check if user has an active study space or create default
        space = db.query(StudySpace).filter(StudySpace.user_id == current_user.id).first()
        if not space:
            space = StudySpace(
                user_id=current_user.id,
                title="100-Day Backend → DevOps",
                category="Backend / DevOps",
                is_active=True
            )
            db.add(space)
            db.flush()

    # Save to storage
    saved_info = document_processor.save_file(file_bytes, file.filename)

    # Extract text with page-level grounding
    try:
        extraction = document_processor.extract_text(saved_info["storage_path"], category)
        page_count = extraction.get("page_count", 1)
        extracted_text = extraction.get("full_text", "")
        processing_status = "READY"
        processing_error = None
    except Exception as err:
        page_count = None
        extracted_text = None
        processing_status = "FAILED"
        processing_error = str(err)

    material = Material(
        user_id=current_user.id,
        study_space_id=space.id,
        title=title or file.filename,
        original_filename=file.filename,
        mime_type=file.content_type,
        file_type=category,
        storage_path=saved_info["storage_path"],
        file_size_bytes=saved_info["file_size"],
        checksum_hash=saved_info["checksum_hash"],
        page_count=page_count,
        processing_status=processing_status,
        processing_error=processing_error,
        extracted_text=extracted_text,
        source_language=source_language or "en"
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


@router.get("", response_model=List[MaterialResponse])
def list_materials(
    study_space_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all materials uploaded by the current user.
    """
    query = db.query(Material).filter(Material.user_id == current_user.id)
    if study_space_id:
        query = query.filter(Material.study_space_id == study_space_id)
    return query.order_by(Material.created_at.desc()).all()


@router.get("/{material_id}", response_model=MaterialDetailResponse)
def get_material(
    material_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get material metadata and text excerpt.
    """
    material = db.query(Material).filter(Material.id == material_id, Material.user_id == current_user.id).first()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found.")

    preview = (material.extracted_text[:600] + "...") if material.extracted_text else None

    return MaterialDetailResponse(
        id=material.id,
        user_id=material.user_id,
        study_space_id=material.study_space_id,
        title=material.title,
        original_filename=material.original_filename,
        mime_type=material.mime_type,
        file_type=material.file_type,
        url=material.url,
        file_size_bytes=material.file_size_bytes,
        checksum_hash=material.checksum_hash,
        page_count=material.page_count,
        processing_status=material.processing_status,
        created_at=material.created_at,
        updated_at=material.updated_at,
        extracted_text_preview=preview
    )


@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_material(
    material_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete material and remove file from disk.
    """
    material = db.query(Material).filter(Material.id == material_id, Material.user_id == current_user.id).first()
    if not material:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found.")

    if material.storage_path and os.path.exists(material.storage_path):
        try:
            os.remove(material.storage_path)
        except OSError:
            pass

    db.delete(material)
    db.commit()
    return None
