# GenAI Stack - Setup Guide

This guide will help you set up and run the GenAI Stack application, a No-Code/Low-Code AI Workflow Builder.

## 🚀 Quick Start (Docker)

The easiest way to get started is using Docker:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd GenAI-Stack
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_API_KEY=your_google_api_key_here
   SERPAPI_KEY=your_serpapi_key_here
   SECRET_KEY=your_secret_key_here
   ```

3. **Start the application:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🛠️ Manual Setup

### Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL 12+
- Git

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
   cp env.example .env
   # Edit .env with your API keys and database credentials
   ```

5. **Set up PostgreSQL database:**
   ```sql
   CREATE DATABASE genai_stack;
   CREATE USER genai_user WITH PASSWORD 'genai_password';
   GRANT ALL PRIVILEGES ON DATABASE genai_stack TO genai_user;
   ```

6. **Run database migrations:**
   ```bash
   python -m alembic upgrade head
   ```

7. **Start the backend server:**
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

4. **Access the application:**
   - Frontend: http://localhost:3000

## 🔑 API Keys Setup

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Add it to your `.env` file

### Google API Key (for Gemini)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### SerpAPI Key (for web search)
1. Go to [SerpAPI](https://serpapi.com/)
2. Create an account
3. Get your API key
4. Add it to your `.env` file

## 📁 Project Structure

```
GenAI-Stack/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Configuration and database
│   │   ├── models/         # Database models
│   │   └── services/       # Business logic
│   ├── alembic/            # Database migrations
│   ├── requirements.txt    # Python dependencies
│   └── main.py            # Application entry point
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── App.js         # Main app component
│   └── package.json       # Node.js dependencies
├── docker-compose.yml      # Docker setup
└── README.md              # Project documentation
```

## 🎯 Features

### Core Components
1. **User Query Component** - Entry point for user queries
2. **Knowledge Base Component** - Document upload and processing
3. **LLM Engine Component** - AI model integration
4. **Output Component** - Chat interface for responses

### Key Features
- **Visual Workflow Builder** - Drag-and-drop interface
- **Document Processing** - PDF upload and text extraction
- **Vector Search** - ChromaDB integration
- **Multiple LLM Support** - OpenAI GPT and Google Gemini
- **Web Search** - SerpAPI integration
- **Real-time Chat** - Interactive workflow testing

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `GOOGLE_API_KEY` | Google API key (for Gemini) | No |
| `SERPAPI_KEY` | SerpAPI key (for web search) | No |
| `SECRET_KEY` | Application secret key | Yes |
| `DEBUG` | Debug mode | No |

### Database Configuration

The application uses PostgreSQL for storing:
- Workflow definitions
- Component configurations
- Document metadata
- Chat history

### File Storage

- **Uploads**: `backend/uploads/` - Document files
- **ChromaDB**: `backend/chroma_db/` - Vector embeddings

## 🚀 Usage

### Creating a Workflow

1. **Create a new stack** from the dashboard
2. **Add components** by dragging from the component panel
3. **Configure components** by clicking on them
4. **Connect components** by dragging between handles
5. **Validate workflow** using the "Build Stack" button
6. **Test workflow** using the "Chat with Stack" feature

### Component Configuration

#### User Query Component
- Placeholder text customization

#### Knowledge Base Component
- Embedding model selection
- API key configuration
- Document upload and management

#### LLM Engine Component
- Model selection (OpenAI/Gemini)
- Temperature control
- Custom prompt templates
- Web search integration

#### Output Component
- Display customization
- Usage information display

## 🔍 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

- `GET /api/v1/workflows` - List workflows
- `POST /api/v1/workflows` - Create workflow
- `GET /api/v1/workflows/{id}` - Get workflow details
- `POST /api/v1/workflows/{id}/execute` - Execute workflow
- `POST /api/v1/chat/{workflow_id}/send` - Send chat message
- `POST /api/v1/documents/upload` - Upload document

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify database credentials in `.env`
   - Run migrations: `python -m alembic upgrade head`

2. **API Key Errors**
   - Verify API keys are set in `.env`
   - Check API key permissions and quotas

3. **Frontend Not Loading**
   - Check backend is running on port 8000
   - Verify CORS settings
   - Check browser console for errors

4. **Document Upload Issues**
   - Check file size limits (10MB default)
   - Verify file is PDF format
   - Check upload directory permissions

### Logs

- **Backend logs**: Check terminal where uvicorn is running
- **Frontend logs**: Check browser developer console
- **Docker logs**: `docker-compose logs -f`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Create an issue in the repository
4. Check the logs for error details 