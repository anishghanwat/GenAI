from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from pydantic import BaseModel
from app.services.llm_service import LLMService
from app.api.dependencies import get_llm_service

router = APIRouter(prefix="/llm", tags=["llm"])


class LLMRequest(BaseModel):
    prompt: str
    model: str = "openai"
    temperature: float = 0.7
    max_tokens: int = 1000


class WebSearchRequest(BaseModel):
    query: str
    num_results: int = 5


@router.get("/models", response_model=Dict[str, List[str]])
async def get_available_models(
    llm_service: LLMService = Depends(get_llm_service)
):
    """Get list of available LLM models"""
    try:
        models = llm_service.get_available_models()
        return models
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching models: {str(e)}"
        )


@router.post("/generate", response_model=Dict[str, Any])
async def generate_response(
    request: LLMRequest,
    llm_service: LLMService = Depends(get_llm_service)
):
    """Generate response using LLM"""
    try:
        if request.model.lower() == "gemini":
            result = llm_service.generate_gemini_response(
                prompt=request.prompt,
                temperature=request.temperature
            )
        else:
            result = llm_service.generate_openai_response(
                prompt=request.prompt,
                temperature=request.temperature,
                max_tokens=request.max_tokens
            )
        
        if "error" in result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating response: {str(e)}"
        )


@router.post("/web-search", response_model=List[Dict[str, Any]])
async def web_search(
    request: WebSearchRequest,
    llm_service: LLMService = Depends(get_llm_service)
):
    """Perform web search"""
    try:
        results = llm_service.web_search(
            query=request.query,
            num_results=request.num_results
        )
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error performing web search: {str(e)}"
        )


@router.post("/generate-with-context", response_model=Dict[str, Any])
async def generate_with_context(
    query: str,
    context: str = "",
    model: str = "openai",
    temperature: float = 0.7,
    use_web_search: bool = False,
    custom_prompt: str = "",
    llm_service: LLMService = Depends(get_llm_service)
):
    """Generate response with optional context and web search"""
    try:
        result = llm_service.generate_response_with_context(
            query=query,
            context=context,
            model=model,
            temperature=temperature,
            use_web_search=use_web_search,
            custom_prompt=custom_prompt
        )
        
        if "error" in result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result["error"]
            )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating response: {str(e)}"
        ) 