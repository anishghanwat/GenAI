from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
from app.core.database import get_db
from app.services.document_service import DocumentService
from app.api.dependencies import get_document_service
import os

router = APIRouter(prefix="/documents", tags=["documents"])


class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_size: int
    mime_type: str
    page_count: int = None
    embedding_status: str
    created_at: str


@router.post("/upload", response_model=Dict[str, Any])
async def upload_document(
    file: UploadFile = File(...),
    workflow_id: int = None,
    db: Session = Depends(get_db),
    document_service: DocumentService = Depends(get_document_service)
):
    """Upload and process a document"""
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are supported"
            )
        
        # Read file content
        file_content = await file.read()
        
        # Check file size
        if len(file_content) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size too large. Maximum size is 10MB"
            )
        
        # Save file
        file_path = await document_service.save_uploaded_file(
            file_content=file_content,
            original_filename=file.filename
        )
        
        # Create document record
        document = await document_service.create_document_record(
            db=db,
            filename=os.path.basename(file_path),
            original_filename=file.filename,
            file_path=file_path,
            file_size=len(file_content),
            mime_type=file.content_type or "application/pdf",
            workflow_id=workflow_id
        )
        
        # Process document (extract text)
        await document_service.process_document(db, document.id)
        
        return {
            "id": document.id,
            "filename": document.filename,
            "original_filename": document.original_filename,
            "file_size": document.file_size,
            "mime_type": document.mime_type,
            "page_count": document.page_count,
            "embedding_status": document.embedding_status,
            "created_at": document.created_at.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading document: {str(e)}"
        )


@router.get("/", response_model=List[Dict[str, Any]])
async def get_documents(
    workflow_id: int = None,
    db: Session = Depends(get_db),
    document_service: DocumentService = Depends(get_document_service)
):
    """Get all documents"""
    try:
        if workflow_id:
            documents = document_service.get_documents_by_workflow(db, workflow_id)
        else:
            # Get all documents (you might want to add pagination)
            documents = document_service.get_all_documents(db)
        
        return [
            {
                "id": doc.id,
                "filename": doc.filename,
                "original_filename": doc.original_filename,
                "file_size": doc.file_size,
                "mime_type": doc.mime_type,
                "page_count": doc.page_count,
                "embedding_status": doc.embedding_status,
                "created_at": doc.created_at.isoformat()
            }
            for doc in documents
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching documents: {str(e)}"
        )


@router.get("/{document_id}", response_model=Dict[str, Any])
async def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    document_service: DocumentService = Depends(get_document_service)
):
    """Get document by ID"""
    document = document_service.get_document_by_id(db, document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return {
        "id": document.id,
        "filename": document.filename,
        "original_filename": document.original_filename,
        "file_size": document.file_size,
        "mime_type": document.mime_type,
        "page_count": document.page_count,
        "embedding_status": document.embedding_status,
        "text_content": document.text_content,
        "created_at": document.created_at.isoformat()
    }


@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    document_service: DocumentService = Depends(get_document_service)
):
    """Delete document"""
    document = document_service.get_document_by_id(db, document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    try:
        # Delete file from filesystem
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
        
        # Delete from database
        db.delete(document)
        db.commit()
        
        return {"message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting document: {str(e)}"
        )


@router.post("/{document_id}/process")
async def process_document(
    document_id: int,
    db: Session = Depends(get_db),
    document_service: DocumentService = Depends(get_document_service)
):
    """Re-process document (extract text)"""
    success = await document_service.process_document(db, document_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or processing failed"
        )
    
    return {"message": "Document processed successfully"} 