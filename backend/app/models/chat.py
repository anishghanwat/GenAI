from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=False)
    session_id = Column(String(255), nullable=False)  # To group messages in a conversation
    message_type = Column(String(20), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Additional metadata
    processing_time = Column(Integer, nullable=True)  # Time taken to process in milliseconds
    tokens_used = Column(Integer, nullable=True)  # Number of tokens used
    model_used = Column(String(100), nullable=True)  # Which model was used for response 