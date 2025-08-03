import openai
import google.generativeai as genai
from typing import Dict, Any, Optional, List
from app.core.config import settings
from serpapi import GoogleSearch
import json


class LLMService:
    def __init__(self):
        # Initialize OpenAI client
        if settings.openai_api_key:
            self.openai_client = openai.OpenAI(api_key=settings.openai_api_key)
        else:
            self.openai_client = None
        
        # Initialize Google Gemini client
        if settings.google_api_key:
            genai.configure(api_key=settings.google_api_key)
            self.gemini_model = genai.GenerativeModel(settings.google_model)
        else:
            self.gemini_model = None
    
    def generate_openai_response(
        self, 
        prompt: str, 
        model: str = None, 
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> Dict[str, Any]:
        """Generate response using OpenAI GPT"""
        if not self.openai_client:
            return {"error": "OpenAI API key not configured"}
        
        try:
            model = model or settings.openai_model
            response = self.openai_client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return {
                "response": response.choices[0].message.content,
                "model": model,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                }
            }
        except Exception as e:
            return {"error": f"OpenAI API error: {str(e)}"}
    
    def generate_gemini_response(
        self, 
        prompt: str, 
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """Generate response using Google Gemini"""
        if not self.gemini_model:
            return {"error": "Google API key not configured"}
        
        try:
            response = self.gemini_model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=temperature
                )
            )
            
            return {
                "response": response.text,
                "model": settings.google_model,
                "usage": {
                    "prompt_tokens": len(prompt.split()),
                    "completion_tokens": len(response.text.split()),
                    "total_tokens": len(prompt.split()) + len(response.text.split())
                }
            }
        except Exception as e:
            return {"error": f"Gemini API error: {str(e)}"}
    
    def web_search(self, query: str, num_results: int = 5) -> List[Dict[str, Any]]:
        """Perform web search using SerpAPI"""
        if not settings.serpapi_key:
            return []
        
        try:
            search = GoogleSearch({
                "q": query,
                "api_key": settings.serpapi_key,
                "num": num_results
            })
            results = search.get_dict()
            
            search_results = []
            if "organic_results" in results:
                for result in results["organic_results"]:
                    search_results.append({
                        "title": result.get("title", ""),
                        "snippet": result.get("snippet", ""),
                        "link": result.get("link", ""),
                        "position": result.get("position", 0)
                    })
            
            return search_results
        except Exception as e:
            print(f"Web search error: {e}")
            return []
    
    def generate_response_with_context(
        self,
        query: str,
        context: str = "",
        model: str = "openai",
        temperature: float = 0.7,
        use_web_search: bool = False,
        custom_prompt: str = ""
    ) -> Dict[str, Any]:
        """Generate response with optional context and web search"""
        
        # Build the prompt
        if custom_prompt:
            prompt = custom_prompt
        else:
            prompt = "You are a helpful AI assistant. "
            if context:
                prompt += f"Use the following context to answer the question:\n\nContext: {context}\n\n"
            if use_web_search:
                prompt += "You can also use web search results if needed.\n\n"
            prompt += f"Question: {query}\n\nAnswer:"
        
        # Add web search results if requested
        if use_web_search:
            web_results = self.web_search(query)
            if web_results:
                web_context = "\n\nWeb Search Results:\n"
                for i, result in enumerate(web_results[:3], 1):
                    web_context += f"{i}. {result['title']}\n{result['snippet']}\n{result['link']}\n\n"
                prompt = prompt.replace("Question:", f"{web_context}\nQuestion:")
        
        # Generate response based on model choice
        if model.lower() == "gemini" and self.gemini_model:
            return self.generate_gemini_response(prompt, temperature)
        elif self.openai_client:
            return self.generate_openai_response(prompt, temperature=temperature)
        else:
            return {"error": "No LLM configured"}
    
    def get_available_models(self) -> Dict[str, List[str]]:
        """Get list of available models"""
        models = {
            "openai": [],
            "gemini": []
        }
        
        if self.openai_client:
            try:
                openai_models = self.openai_client.models.list()
                models["openai"] = [model.id for model in openai_models.data if "gpt" in model.id]
            except:
                models["openai"] = [settings.openai_model]
        
        if self.gemini_model:
            models["gemini"] = [settings.google_model]
        
        return models 