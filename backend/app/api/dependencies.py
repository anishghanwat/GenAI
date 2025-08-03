from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.workflow_service import WorkflowService
from app.services.document_service import DocumentService
from app.services.llm_service import LLMService
from app.services.embedding_service import EmbeddingService
from app.services.chat_service import ChatService


def get_workflow_service() -> WorkflowService:
    return WorkflowService()


def get_document_service() -> DocumentService:
    return DocumentService()


def get_llm_service() -> LLMService:
    return LLMService()


def get_embedding_service() -> EmbeddingService:
    return EmbeddingService()


def get_chat_service() -> ChatService:
    return ChatService() 