from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./genai_stack.db"
    
    # OpenAI
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-large"
    
    # Google (Gemini)
    google_api_key: Optional[str] = None
    google_model: str = "gemini-pro"
    
    # SerpAPI
    serpapi_key: Optional[str] = None
    
    # ChromaDB
    chroma_persist_directory: str = "./chroma_db"
    
    # Application
    secret_key: str = "your-secret-key-change-this"
    debug: bool = True
    allowed_hosts: List[str] = ["*"]
    
    # File Upload
    max_file_size: int = 10485760  # 10MB
    upload_dir: str = "./uploads"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings() 