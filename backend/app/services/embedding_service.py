import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
from app.core.config import settings
import openai
import os


class EmbeddingService:
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=settings.openai_api_key)
        self.chroma_client = chromadb.PersistentClient(
            path=settings.chroma_persist_directory,
            settings=Settings(anonymized_telemetry=False)
        )
    
    def create_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Create embeddings for a list of texts using OpenAI"""
        try:
            response = self.openai_client.embeddings.create(
                model=settings.openai_embedding_model,
                input=texts
            )
            return [embedding.embedding for embedding in response.data]
        except Exception as e:
            print(f"Error creating embeddings: {e}")
            return []
    
    def create_collection(self, collection_name: str) -> chromadb.Collection:
        """Create or get a ChromaDB collection"""
        try:
            return self.chroma_client.get_or_create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"}
            )
        except Exception as e:
            print(f"Error creating collection: {e}")
            return None
    
    def add_documents_to_collection(
        self, 
        collection_name: str, 
        documents: List[str], 
        metadatas: List[Dict[str, Any]], 
        ids: List[str]
    ) -> bool:
        """Add documents to a ChromaDB collection"""
        try:
            collection = self.create_collection(collection_name)
            if not collection:
                return False
            
            # Create embeddings
            embeddings = self.create_embeddings(documents)
            if not embeddings:
                return False
            
            # Add to collection
            collection.add(
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids
            )
            return True
        except Exception as e:
            print(f"Error adding documents to collection: {e}")
            return False
    
    def search_similar_documents(
        self, 
        collection_name: str, 
        query: str, 
        n_results: int = 5
    ) -> List[Dict[str, Any]]:
        """Search for similar documents in a collection"""
        try:
            collection = self.create_collection(collection_name)
            if not collection:
                return []
            
            # Create embedding for query
            query_embeddings = self.create_embeddings([query])
            if not query_embeddings:
                return []
            
            # Search
            results = collection.query(
                query_embeddings=query_embeddings,
                n_results=n_results,
                include=["documents", "metadatas", "distances"]
            )
            
            # Format results
            formatted_results = []
            if results["documents"] and results["documents"][0]:
                for i in range(len(results["documents"][0])):
                    formatted_results.append({
                        "document": results["documents"][0][i],
                        "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                        "distance": results["distances"][0][i] if results["distances"] else 0
                    })
            
            return formatted_results
        except Exception as e:
            print(f"Error searching documents: {e}")
            return []
    
    def delete_collection(self, collection_name: str) -> bool:
        """Delete a ChromaDB collection"""
        try:
            self.chroma_client.delete_collection(name=collection_name)
            return True
        except Exception as e:
            print(f"Error deleting collection: {e}")
            return False
    
    def get_collection_info(self, collection_name: str) -> Optional[Dict[str, Any]]:
        """Get information about a collection"""
        try:
            collection = self.create_collection(collection_name)
            if not collection:
                return None
            
            count = collection.count()
            return {
                "name": collection_name,
                "count": count,
                "metadata": collection.metadata
            }
        except Exception as e:
            print(f"Error getting collection info: {e}")
            return None 