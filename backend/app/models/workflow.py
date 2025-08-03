from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Workflow(Base):
    __tablename__ = "workflows"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship to components
    components = relationship("WorkflowComponent", back_populates="workflow", cascade="all, delete-orphan")


class WorkflowComponent(Base):
    __tablename__ = "workflow_components"
    
    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=False)
    component_type = Column(String(50), nullable=False)  # user_query, knowledge_base, llm_engine, output
    position_x = Column(Integer, default=0)
    position_y = Column(Integer, default=0)
    configuration = Column(JSON, nullable=True)  # Store component-specific settings
    connections = Column(JSON, nullable=True)  # Store connection data
    
    # Relationship to workflow
    workflow = relationship("Workflow", back_populates="components") 