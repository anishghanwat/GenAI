import os
import fitz  # PyMuPDF
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.document import Document
from app.core.config import settings
import aiofiles
import uuid


class DocumentService:
    def __init__(self):
        self.upload_dir = settings.upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)
    
    async def save_uploaded_file(self, file_content: bytes, original_filename: str) -> str:
        """Save uploaded file and return the file path"""
        # Generate unique filename
        file_extension = os.path.splitext(original_filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(self.upload_dir, unique_filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_content)
        
        return file_path
    
    def extract_text_from_pdf(self, file_path: str) -> Dict[str, Any]:
        """Extract text content from PDF file"""
        try:
            doc = fitz.open(file_path)
            text_content = ""
            page_count = len(doc)
            
            for page_num in range(page_count):
                page = doc.load_page(page_num)
                text_content += page.get_text()
            
            doc.close()
            
            return {
                "text_content": text_content,
                "page_count": page_count,
                "success": True
            }
        except Exception as e:
            return {
                "text_content": "",
                "page_count": 0,
                "success": False,
                "error": str(e)
            }
    
    async def create_document_record(
        self, 
        db: Session, 
        filename: str, 
        original_filename: str, 
        file_path: str, 
        file_size: int, 
        mime_type: str,
        workflow_id: Optional[int] = None
    ) -> Document:
        """Create a document record in the database"""
        document = Document(
            filename=filename,
            original_filename=original_filename,
            file_path=file_path,
            file_size=file_size,
            mime_type=mime_type,
            workflow_id=workflow_id
        )
        
        db.add(document)
        db.commit()
        db.refresh(document)
        
        return document
    
    async def process_document(self, db: Session, document_id: int) -> bool:
        """Process document: extract text and update record"""
        document = db.query(Document).filter(Document.id == document_id).first()
        if not document:
            return False
        
        # Extract text from PDF
        extraction_result = self.extract_text_from_pdf(document.file_path)
        
        if extraction_result["success"]:
            document.text_content = extraction_result["text_content"]
            document.page_count = extraction_result["page_count"]
            document.embedding_status = "completed"
        else:
            document.embedding_status = "failed"
        
        db.commit()
        return extraction_result["success"]
    
    def get_document_by_id(self, db: Session, document_id: int) -> Optional[Document]:
        """Get document by ID"""
        return db.query(Document).filter(Document.id == document_id).first()
    
    def get_documents_by_workflow(self, db: Session, workflow_id: int) -> list[Document]:
        """Get all documents for a specific workflow"""
        return db.query(Document).filter(Document.workflow_id == workflow_id).all()
    
    def get_all_documents(self, db: Session) -> list[Document]:
        """Get all documents"""
        return db.query(Document).all() 