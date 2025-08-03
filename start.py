#!/usr/bin/env python3
"""
GenAI Stack - Startup Script
This script helps you start the backend server and provides setup instructions.
"""

import os
import sys
import subprocess
import platform

def print_banner():
    print("=" * 60)
    print("🚀 GenAI Stack - No-Code/Low-Code AI Workflow Builder")
    print("=" * 60)
    print()

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True

def check_dependencies():
    """Check if required dependencies are installed"""
    print("📦 Checking dependencies...")
    
    try:
        import fastapi
        print("✅ FastAPI installed")
    except ImportError:
        print("❌ FastAPI not installed")
        return False
    
    try:
        import uvicorn
        print("✅ Uvicorn installed")
    except ImportError:
        print("❌ Uvicorn not installed")
        return False
    
    try:
        import sqlalchemy
        print("✅ SQLAlchemy installed")
    except ImportError:
        print("❌ SQLAlchemy not installed")
        return False
    
    return True

def setup_environment():
    """Setup environment variables"""
    print("🔧 Setting up environment...")
    
    # Create .env file if it doesn't exist
    env_file = "backend/.env"
    if not os.path.exists(env_file):
        print("📝 Creating .env file...")
        with open(env_file, "w") as f:
            f.write("""# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/genai_stack

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# Google (Gemini) Configuration
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_MODEL=gemini-pro

# SerpAPI Configuration
SERPAPI_KEY=your_serpapi_key_here

# ChromaDB Configuration
CHROMA_PERSIST_DIRECTORY=./chroma_db

# Application Configuration
SECRET_KEY=your_secret_key_here
DEBUG=True
ALLOWED_HOSTS=["*"]

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
""")
        print("✅ .env file created")
        print("⚠️  Please edit backend/.env with your API keys")
    else:
        print("✅ .env file already exists")

def install_dependencies():
    """Install Python dependencies"""
    print("📦 Installing dependencies...")
    
    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"
        ], check=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        return False

def start_backend():
    """Start the backend server"""
    print("🚀 Starting backend server...")
    
    # Change to backend directory
    os.chdir("backend")
    
    try:
        # Start the server
        subprocess.run([
            sys.executable, "-m", "uvicorn", "main:app", 
            "--reload", "--host", "0.0.0.0", "--port", "8000"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

def main():
    print_banner()
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Setup environment
    setup_environment()
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies")
        print("Please run: pip install -r backend/requirements.txt")
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        print("❌ Missing dependencies")
        print("Please run: pip install -r backend/requirements.txt")
        sys.exit(1)
    
    print("\n🎉 Setup complete!")
    print("\n📋 Next steps:")
    print("1. Edit backend/.env with your API keys")
    print("2. Set up PostgreSQL database")
    print("3. Run database migrations: python -m alembic upgrade head")
    print("4. Start frontend: cd frontend && npm start")
    print("5. Backend will start automatically")
    
    print("\n🚀 Starting backend server...")
    start_backend()

if __name__ == "__main__":
    main() 