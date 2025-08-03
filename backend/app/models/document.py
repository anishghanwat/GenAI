from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Additional metadata
    page_count = Column(Integer, nullable=True)
    text_content = Column(Text, nullable=True)  # Extracted text content
    embedding_status = Column(String(50), default="pending")  # pending, processing, completed, failed 