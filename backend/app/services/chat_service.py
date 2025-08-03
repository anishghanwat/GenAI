from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.chat import ChatMessage
from app.services.workflow_service import WorkflowService
import uuid
from datetime import datetime


class ChatService:
    def __init__(self):
        self.workflow_service = WorkflowService()
    
    def create_chat_message(
        self, 
        db: Session, 
        workflow_id: int, 
        session_id: str, 
        message_type: str, 
        content: str,
        processing_time: int = None,
        tokens_used: int = None,
        model_used: str = None
    ) -> ChatMessage:
        """Create a new chat message"""
        chat_message = ChatMessage(
            workflow_id=workflow_id,
            session_id=session_id,
            message_type=message_type,
            content=content,
            processing_time=processing_time,
            tokens_used=tokens_used,
            model_used=model_used
        )
        
        db.add(chat_message)
        db.commit()
        db.refresh(chat_message)
        return chat_message
    
    def get_chat_history(
        self, 
        db: Session, 
        workflow_id: int, 
        session_id: str = None,
        limit: int = 50
    ) -> List[ChatMessage]:
        """Get chat history for a workflow"""
        query = db.query(ChatMessage).filter(ChatMessage.workflow_id == workflow_id)
        
        if session_id:
            query = query.filter(ChatMessage.session_id == session_id)
        
        return query.order_by(ChatMessage.created_at.desc()).limit(limit).all()
    
    def get_session_messages(
        self, 
        db: Session, 
        session_id: str
    ) -> List[ChatMessage]:
        """Get all messages for a specific session"""
        return db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.created_at.asc()).all()
    
    def create_session_id(self) -> str:
        """Create a new session ID"""
        return str(uuid.uuid4())
    
    def process_user_message(
        self, 
        db: Session, 
        workflow_id: int, 
        user_message: str, 
        session_id: str = None
    ) -> Dict[str, Any]:
        """Process a user message through the workflow"""
        start_time = datetime.now()
        
        # Create session ID if not provided
        if not session_id:
            session_id = self.create_session_id()
        
        # Save user message
        user_chat_message = self.create_chat_message(
            db=db,
            workflow_id=workflow_id,
            session_id=session_id,
            message_type="user",
            content=user_message
        )
        
        # Execute workflow
        workflow_result = self.workflow_service.execute_workflow(
            db=db,
            workflow_id=workflow_id,
            user_query=user_message,
            session_id=session_id
        )
        
        # Calculate processing time
        end_time = datetime.now()
        processing_time = int((end_time - start_time).total_seconds() * 1000)
        
        if workflow_result["success"]:
            # Save assistant response
            assistant_chat_message = self.create_chat_message(
                db=db,
                workflow_id=workflow_id,
                session_id=session_id,
                message_type="assistant",
                content=workflow_result["response"],
                processing_time=processing_time,
                tokens_used=workflow_result.get("usage", {}).get("total_tokens"),
                model_used=workflow_result.get("model")
            )
            
            return {
                "success": True,
                "session_id": session_id,
                "response": workflow_result["response"],
                "model": workflow_result.get("model"),
                "usage": workflow_result.get("usage"),
                "processing_time": processing_time,
                "context_used": workflow_result.get("context_used", False)
            }
        else:
            # Save error message
            error_chat_message = self.create_chat_message(
                db=db,
                workflow_id=workflow_id,
                session_id=session_id,
                message_type="system",
                content=f"Error: {workflow_result['error']}",
                processing_time=processing_time
            )
            
            return {
                "success": False,
                "session_id": session_id,
                "error": workflow_result["error"],
                "processing_time": processing_time
            }
    
    def get_conversation_summary(
        self, 
        db: Session, 
        session_id: str
    ) -> Dict[str, Any]:
        """Get summary of a conversation session"""
        messages = self.get_session_messages(db, session_id)
        
        if not messages:
            return {
                "session_id": session_id,
                "message_count": 0,
                "total_tokens": 0,
                "models_used": [],
                "duration": 0
            }
        
        # Calculate summary
        user_messages = [m for m in messages if m.message_type == "user"]
        assistant_messages = [m for m in messages if m.message_type == "assistant"]
        
        total_tokens = sum(m.tokens_used or 0 for m in messages)
        models_used = list(set(m.model_used for m in messages if m.model_used))
        
        # Calculate duration
        if len(messages) >= 2:
            duration = (messages[-1].created_at - messages[0].created_at).total_seconds()
        else:
            duration = 0
        
        return {
            "session_id": session_id,
            "message_count": len(messages),
            "user_messages": len(user_messages),
            "assistant_messages": len(assistant_messages),
            "total_tokens": total_tokens,
            "models_used": models_used,
            "duration": duration,
            "start_time": messages[0].created_at if messages else None,
            "end_time": messages[-1].created_at if messages else None
        }
    
    def delete_session_messages(
        self, 
        db: Session, 
        session_id: str
    ) -> bool:
        """Delete all messages for a session"""
        try:
            db.query(ChatMessage).filter(
                ChatMessage.session_id == session_id
            ).delete()
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            print(f"Error deleting session messages: {e}")
            return False 