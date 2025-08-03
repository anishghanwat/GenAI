from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
from app.core.database import get_db
from app.services.chat_service import ChatService
from app.api.dependencies import get_chat_service

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessageRequest(BaseModel):
    message: str
    session_id: str = None


class ChatMessageResponse(BaseModel):
    id: int
    message_type: str
    content: str
    created_at: str
    processing_time: int = None
    tokens_used: int = None
    model_used: str = None


@router.post("/{workflow_id}/send", response_model=Dict[str, Any])
async def send_message(
    workflow_id: int,
    message_data: ChatMessageRequest,
    db: Session = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service)
):
    """Send a message to a workflow and get response"""
    try:
        result = chat_service.process_user_message(
            db=db,
            workflow_id=workflow_id,
            user_message=message_data.message,
            session_id=message_data.session_id
        )
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        return {
            "success": True,
            "session_id": result["session_id"],
            "response": result["response"],
            "model": result.get("model"),
            "usage": result.get("usage"),
            "processing_time": result.get("processing_time"),
            "context_used": result.get("context_used", False)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing message: {str(e)}"
        )


@router.get("/{workflow_id}/history", response_model=List[Dict[str, Any]])
async def get_chat_history(
    workflow_id: int,
    session_id: str = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service)
):
    """Get chat history for a workflow"""
    try:
        messages = chat_service.get_chat_history(
            db=db,
            workflow_id=workflow_id,
            session_id=session_id,
            limit=limit
        )
        
        return [
            {
                "id": msg.id,
                "session_id": msg.session_id,
                "message_type": msg.message_type,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
                "processing_time": msg.processing_time,
                "tokens_used": msg.tokens_used,
                "model_used": msg.model_used
            }
            for msg in messages
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching chat history: {str(e)}"
        )


@router.get("/sessions/{session_id}", response_model=List[Dict[str, Any]])
async def get_session_messages(
    session_id: str,
    db: Session = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service)
):
    """Get all messages for a specific session"""
    try:
        messages = chat_service.get_session_messages(db, session_id)
        
        return [
            {
                "id": msg.id,
                "workflow_id": msg.workflow_id,
                "message_type": msg.message_type,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
                "processing_time": msg.processing_time,
                "tokens_used": msg.tokens_used,
                "model_used": msg.model_used
            }
            for msg in messages
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching session messages: {str(e)}"
        )


@router.get("/sessions/{session_id}/summary", response_model=Dict[str, Any])
async def get_session_summary(
    session_id: str,
    db: Session = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service)
):
    """Get summary of a conversation session"""
    try:
        summary = chat_service.get_conversation_summary(db, session_id)
        return summary
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching session summary: {str(e)}"
        )


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
    chat_service: ChatService = Depends(get_chat_service)
):
    """Delete all messages for a session"""
    try:
        success = chat_service.delete_session_messages(db, session_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error deleting session messages"
            )
        
        return {"message": "Session deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting session: {str(e)}"
        )


@router.post("/sessions/new")
async def create_new_session(
    chat_service: ChatService = Depends(get_chat_service)
):
    """Create a new session ID"""
    try:
        session_id = chat_service.create_session_id()
        return {"session_id": session_id}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating session: {str(e)}"
        ) 