# GenAI Stack - No-Code/Low-Code AI Workflow Builder

A full-stack web application that enables users to visually create and interact with intelligent workflows using drag-and-drop components.

## 🎯 Features

- **Visual Workflow Builder**: Drag-and-drop interface for creating AI workflows
- **Core Components**: User Query, KnowledgeBase, LLM Engine, and Output components
- **Document Processing**: Upload and process PDFs with text extraction
- **Vector Search**: Store and retrieve embeddings using ChromaDB
- **LLM Integration**: Support for OpenAI GPT and Gemini models
- **Web Search**: Optional SerpAPI integration for real-time information
- **Chat Interface**: Interactive chat for testing workflows

## 🏗️ Architecture

```
GenAI Stack/
├── frontend/          # React.js application
├── backend/           # FastAPI application
├── database/          # PostgreSQL setup
└── docs/             # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- Python (v3.8+)
- PostgreSQL
- Docker (optional)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and database credentials
   ```

5. **Run database migrations:**
   ```bash
   python -m alembic upgrade head
   ```

6. **Start the backend server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/genai_stack

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Google (Gemini)
GOOGLE_API_KEY=your_google_api_key

# SerpAPI
SERPAPI_KEY=your_serpapi_key

# ChromaDB
CHROMA_PERSIST_DIRECTORY=./chroma_db
```

## 📁 Project Structure

### Backend Structure
```
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   └── dependencies.py
│   ├── core/
│   │   ├── config.py
│   │   └── database.py
│   ├── models/
│   ├── services/
│   └── utils/
├── alembic/
├── requirements.txt
└── main.py
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Canvas/
│   │   ├── Components/
│   │   └── Chat/
│   ├── hooks/
│   ├── services/
│   └── utils/
├── public/
└── package.json
```

## 🎨 Core Components

### 1. User Query Component
- Entry point for user queries
- Simple text input interface
- Sends queries to connected components

### 2. KnowledgeBase Component
- Document upload and processing
- Text extraction from PDFs
- Embedding generation and storage
- Context retrieval based on queries

### 3. LLM Engine Component
- Integration with OpenAI GPT and Gemini
- Custom prompt configuration
- Optional web search via SerpAPI
- Response generation

### 4. Output Component
- Chat interface for user interaction
- Display final responses
- Support for follow-up questions

## 🔄 Workflow Execution

1. **Build Stack**: Users connect components in logical order
2. **Validation**: System validates workflow correctness
3. **Chat Interface**: Users interact with built workflows
4. **Execution**: Queries flow through: User Query → KnowledgeBase → LLM → Output

## 🛠️ Tech Stack

- **Frontend**: React.js, React Flow, Material-UI
- **Backend**: FastAPI, SQLAlchemy, Alembic
- **Database**: PostgreSQL
- **Vector Store**: ChromaDB
- **LLM**: OpenAI GPT, Google Gemini
- **Embeddings**: OpenAI Embeddings, Google Embeddings
- **Web Search**: SerpAPI
- **Document Processing**: PyMuPDF

## 📝 API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions, please create an issue in the repository. 