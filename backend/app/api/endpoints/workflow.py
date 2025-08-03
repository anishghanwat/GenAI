from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
from app.core.database import get_db
from app.services.workflow_service import WorkflowService
from app.api.dependencies import get_workflow_service

router = APIRouter(prefix="/workflows", tags=["workflows"])


class WorkflowCreate(BaseModel):
    name: str
    description: str = None


class WorkflowUpdate(BaseModel):
    name: str = None
    description: str = None


class ComponentCreate(BaseModel):
    component_type: str
    position_x: int
    position_y: int
    configuration: Dict[str, Any] = None


class ComponentUpdate(BaseModel):
    configuration: Dict[str, Any] = None
    position_x: int = None
    position_y: int = None


@router.post("/", response_model=Dict[str, Any])
async def create_workflow(
    workflow_data: WorkflowCreate,
    db: Session = Depends(get_db),
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """Create a new workflow"""
    try:
        workflow = workflow_service.create_workflow(
            db=db,
            name=workflow_data.name,
            description=workflow_data.description
        )
        return {
            "id": workflow.id,
            "name": workflow.name,
            "description": workflow.description,
            "created_at": workflow.created_at
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating workflow: {str(e)}"
        )


@router.get("/", response_model=List[Dict[str, Any]])
async def get_workflows(
    db: Session = Depends(get_db),
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """Get all workflows"""
    try:
        workflows = workflow_service.get_all_workflows(db)
        return [
            {
                "id": w.id,
                "name": w.name,
                "description": w.description,
                "created_at": w.created_at,
                "updated_at": w.updated_at
            }
            for w in workflows
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching workflows: {str(e)}"
        )


@router.get("/{workflow_id}", response_model=Dict[str, Any])
async def get_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """Get workflow by ID"""
    workflow = workflow_service.get_workflow(db, workflow_id)
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    components = workflow_service.get_workflow_components(db, workflow_id)
    
    return {
        "id": workflow.id,
        "name": workflow.name,
        "description": workflow.description,
        "created_at": workflow.created_at,
        "updated_at": workflow.updated_at,
        "components": [
            {
                "id": c.id,
                "component_type": c.component_type,
                "position_x": c.position_x,
                "position_y": c.position_y,
                "configuration": c.configuration
            }
            for c in components
        ]
    }


@router.put("/{workflow_id}", response_model=Dict[str, Any])
async def update_workflow(
    workflow_id: int,
    workflow_data: WorkflowUpdate,
    db: Session = Depends(get_db),
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """Update workflow"""
    workflow = workflow_service.update_workflow(
        db=db,
        workflow_id=workflow_id,
        name=workflow_data.name,
        description=workflow_data.description
    )
    
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    return {
        "id": workflow.id,
        "name": workflow.name,
        "description": workflow.description,
        "updated_at": workflow.updated_at
    }


@router.delete("/{workflow_id}")
async def delete_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """Delete workflow"""
    success = workflow_service.delete_workflow(db, workflow_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    return {"message": "Workflow deleted successfully"}


@router.post("/{workflow_id}/components", response_model=Dict[str, Any])
async def add_component(
    workflow_id: int,
    component_data: ComponentCreate,
    db: Session = Depends(get_db),
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """Add component to workflow"""
    component = workflow_service.add_component(
        db=db,
        workflow_id=workflow_id,
        component_type=component_data.component_type,
        position_x=component_data.position_x,
        position_y=component_data.position_y,
        configuration=component_data.configuration
    )
    
    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    return {
        "id": component.id,
        "component_type": component.component_type,
        "position_x": component.position_x,
        "position_y": component.position_y,
        "configuration": component.configuration
    }


@router.put("/components/{component_id}", response_model=Dict[str, Any])
async def update_component(
    component_id: int,
    component_data: ComponentUpdate,
    db: Session = Depends(get_db),
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """Update component configuration"""
    component = workflow_service.update_component(
        db=db,
        component_id=component_id,
        configuration=component_data.configuration,
        position_x=component_data.position_x,
        position_y=component_data.position_y
    )
    
    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Component not found"
        )
    
    return {
        "id": component.id,
        "component_type": component.component_type,
        "position_x": component.position_x,
        "position_y": component.position_y,
        "configuration": component.configuration
    }


@router.get("/{workflow_id}/validate", response_model=Dict[str, Any])
async def validate_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """Validate workflow structure and configuration"""
    validation_result = workflow_service.validate_workflow(db, workflow_id)
    return validation_result


@router.post("/{workflow_id}/execute", response_model=Dict[str, Any])
async def execute_workflow(
    workflow_id: int,
    query: str,
    session_id: str = None,
    db: Session = Depends(get_db),
    workflow_service: WorkflowService = Depends(get_workflow_service)
):
    """Execute workflow with a query"""
    result = workflow_service.execute_workflow(
        db=db,
        workflow_id=workflow_id,
        user_query=query,
        session_id=session_id
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    return result 