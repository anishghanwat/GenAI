from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.workflow import Workflow, WorkflowComponent
from app.services.llm_service import LLMService
from app.services.embedding_service import EmbeddingService
import json


class WorkflowService:
    def __init__(self):
        self.llm_service = LLMService()
        self.embedding_service = EmbeddingService()
    
    def create_workflow(
        self, 
        db: Session, 
        name: str, 
        description: str = None
    ) -> Workflow:
        """Create a new workflow"""
        workflow = Workflow(
            name=name,
            description=description
        )
        db.add(workflow)
        db.commit()
        db.refresh(workflow)
        return workflow
    
    def get_workflow(self, db: Session, workflow_id: int) -> Optional[Workflow]:
        """Get workflow by ID"""
        return db.query(Workflow).filter(Workflow.id == workflow_id).first()
    
    def get_all_workflows(self, db: Session) -> List[Workflow]:
        """Get all workflows"""
        return db.query(Workflow).filter(Workflow.is_active == True).all()
    
    def update_workflow(
        self, 
        db: Session, 
        workflow_id: int, 
        name: str = None, 
        description: str = None
    ) -> Optional[Workflow]:
        """Update workflow"""
        workflow = self.get_workflow(db, workflow_id)
        if not workflow:
            return None
        
        if name:
            workflow.name = name
        if description is not None:
            workflow.description = description
        
        db.commit()
        db.refresh(workflow)
        return workflow
    
    def delete_workflow(self, db: Session, workflow_id: int) -> bool:
        """Delete workflow"""
        workflow = self.get_workflow(db, workflow_id)
        if not workflow:
            return False
        
        workflow.is_active = False
        db.commit()
        return True
    
    def add_component(
        self, 
        db: Session, 
        workflow_id: int, 
        component_type: str, 
        position_x: int, 
        position_y: int, 
        configuration: Dict[str, Any] = None
    ) -> Optional[WorkflowComponent]:
        """Add component to workflow"""
        workflow = self.get_workflow(db, workflow_id)
        if not workflow:
            return None
        
        component = WorkflowComponent(
            workflow_id=workflow_id,
            component_type=component_type,
            position_x=position_x,
            position_y=position_y,
            configuration=configuration or {}
        )
        
        db.add(component)
        db.commit()
        db.refresh(component)
        return component
    
    def update_component(
        self, 
        db: Session, 
        component_id: int, 
        configuration: Dict[str, Any] = None,
        position_x: int = None,
        position_y: int = None
    ) -> Optional[WorkflowComponent]:
        """Update component configuration"""
        component = db.query(WorkflowComponent).filter(WorkflowComponent.id == component_id).first()
        if not component:
            return None
        
        if configuration is not None:
            component.configuration = configuration
        if position_x is not None:
            component.position_x = position_x
        if position_y is not None:
            component.position_y = position_y
        
        db.commit()
        db.refresh(component)
        return component
    
    def get_workflow_components(self, db: Session, workflow_id: int) -> List[WorkflowComponent]:
        """Get all components for a workflow"""
        return db.query(WorkflowComponent).filter(WorkflowComponent.workflow_id == workflow_id).all()
    
    def validate_workflow(self, db: Session, workflow_id: int) -> Dict[str, Any]:
        """Validate workflow structure and configuration"""
        components = self.get_workflow_components(db, workflow_id)
        
        # Check if workflow has required components
        component_types = [comp.component_type for comp in components]
        
        validation_result = {
            "valid": True,
            "errors": [],
            "warnings": []
        }
        
        # Check for required components
        if "user_query" not in component_types:
            validation_result["valid"] = False
            validation_result["errors"].append("Missing User Query component")
        
        if "output" not in component_types:
            validation_result["valid"] = False
            validation_result["errors"].append("Missing Output component")
        
        # Check for LLM component
        if "llm_engine" not in component_types:
            validation_result["warnings"].append("No LLM Engine component found")
        
        # Check component configurations
        for component in components:
            if component.component_type == "llm_engine":
                config = component.configuration or {}
                if not config.get("api_key"):
                    validation_result["warnings"].append("LLM Engine missing API key")
                if not config.get("model"):
                    validation_result["warnings"].append("LLM Engine missing model selection")
            
            elif component.component_type == "knowledge_base":
                config = component.configuration or {}
                if not config.get("embedding_model"):
                    validation_result["warnings"].append("Knowledge Base missing embedding model")
        
        return validation_result
    
    def execute_workflow(
        self, 
        db: Session, 
        workflow_id: int, 
        user_query: str,
        session_id: str = None
    ) -> Dict[str, Any]:
        """Execute workflow with user query"""
        # Get workflow components
        components = self.get_workflow_components(db, workflow_id)
        
        # Validate workflow
        validation = self.validate_workflow(db, workflow_id)
        if not validation["valid"]:
            return {
                "success": False,
                "error": "Invalid workflow",
                "validation_errors": validation["errors"]
            }
        
        # Find components by type
        user_query_comp = next((c for c in components if c.component_type == "user_query"), None)
        knowledge_base_comp = next((c for c in components if c.component_type == "knowledge_base"), None)
        llm_comp = next((c for c in components if c.component_type == "llm_engine"), None)
        output_comp = next((c for c in components if c.component_type == "output"), None)
        
        # Execute workflow
        context = ""
        
        # Step 1: Process through Knowledge Base if present
        if knowledge_base_comp:
            config = knowledge_base_comp.configuration or {}
            collection_name = config.get("collection_name", f"workflow_{workflow_id}")
            
            # Search for relevant context
            search_results = self.embedding_service.search_similar_documents(
                collection_name=collection_name,
                query=user_query,
                n_results=3
            )
            
            if search_results:
                context = "\n".join([result["document"] for result in search_results])
        
        # Step 2: Generate response using LLM
        if llm_comp:
            config = llm_comp.configuration or {}
            model = config.get("model", "openai")
            temperature = config.get("temperature", 0.7)
            custom_prompt = config.get("prompt", "")
            use_web_search = config.get("use_web_search", False)
            
            response = self.llm_service.generate_response_with_context(
                query=user_query,
                context=context,
                model=model,
                temperature=temperature,
                use_web_search=use_web_search,
                custom_prompt=custom_prompt
            )
            
            if "error" in response:
                return {
                    "success": False,
                    "error": response["error"]
                }
            
            return {
                "success": True,
                "response": response["response"],
                "model": response["model"],
                "usage": response["usage"],
                "context_used": bool(context)
            }
        else:
            # No LLM component, return simple response
            return {
                "success": True,
                "response": f"Query received: {user_query}",
                "model": "simple",
                "usage": {"total_tokens": len(user_query.split())},
                "context_used": bool(context)
            } 