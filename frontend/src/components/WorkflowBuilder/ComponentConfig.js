import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Button,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { documentAPI, llmAPI } from '../../services/api';

const ComponentConfig = ({ component, onUpdate }) => {
  const [config, setConfig] = useState(component.configuration || {});
  const [showApiKey, setShowApiKey] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [models, setModels] = useState({ openai: [], gemini: [] });

  useEffect(() => {
    if (component.componentType === 'knowledge_base') {
      fetchDocuments();
    }
    if (component.componentType === 'llm_engine') {
      fetchModels();
    }
  }, [component.componentType]);

  const fetchDocuments = async () => {
    try {
      const response = await documentAPI.getDocuments();
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await llmAPI.getModels();
      setModels(response.data);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onUpdate(config);
  };

  const renderUserQueryConfig = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        User Query Configuration
      </Typography>
      <TextField
        fullWidth
        label="Placeholder Text"
        value={config.placeholder || 'Write your query here'}
        onChange={(e) => handleConfigChange('placeholder', e.target.value)}
        sx={{ mb: 2 }}
      />
    </Box>
  );

  const renderKnowledgeBaseConfig = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Knowledge Base Configuration
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Embedding Model</InputLabel>
        <Select
          value={config.embedding_model || 'text-embedding-3-large'}
          onChange={(e) => handleConfigChange('embedding_model', e.target.value)}
        >
          <MenuItem value="text-embedding-3-large">text-embedding-3-large</MenuItem>
          <MenuItem value="text-embedding-3-small">text-embedding-3-small</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="API Key"
        type={showApiKey ? 'text' : 'password'}
        value={config.api_key || ''}
        onChange={(e) => handleConfigChange('api_key', e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowApiKey(!showApiKey)}
                edge="end"
              >
                {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <Typography variant="subtitle2" gutterBottom>
        Uploaded Documents
      </Typography>
      {documents.length > 0 ? (
        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
          {documents.map((doc) => (
            <Box key={doc.id} sx={{ p: 1, border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
              <Typography variant="body2">{doc.original_filename}</Typography>
              <Typography variant="caption" color="text.secondary">
                {doc.page_count} pages • {doc.embedding_status}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No documents uploaded
        </Typography>
      )}
    </Box>
  );

  const renderLLMConfig = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        LLM Engine Configuration
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Model</InputLabel>
        <Select
          value={config.model || 'openai'}
          onChange={(e) => handleConfigChange('model', e.target.value)}
        >
          <MenuItem value="openai">OpenAI GPT</MenuItem>
          <MenuItem value="gemini">Google Gemini</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="API Key"
        type={showApiKey ? 'text' : 'password'}
        value={config.api_key || ''}
        onChange={(e) => handleConfigChange('api_key', e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowApiKey(!showApiKey)}
                edge="end"
              >
                {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Temperature"
        type="number"
        value={config.temperature || 0.7}
        onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
        inputProps={{ min: 0, max: 1, step: 0.1 }}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Custom Prompt"
        multiline
        rows={4}
        value={config.prompt || ''}
        onChange={(e) => handleConfigChange('prompt', e.target.value)}
        placeholder="Enter custom prompt template..."
        sx={{ mb: 2 }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={config.use_web_search || false}
            onChange={(e) => handleConfigChange('use_web_search', e.target.checked)}
          />
        }
        label="Enable Web Search"
        sx={{ mb: 2 }}
      />

      {config.use_web_search && (
        <TextField
          fullWidth
          label="SerpAPI Key"
          type={showApiKey ? 'text' : 'password'}
          value={config.serpapi_key || ''}
          onChange={(e) => handleConfigChange('serpapi_key', e.target.value)}
          sx={{ mb: 2 }}
        />
      )}
    </Box>
  );

  const renderOutputConfig = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Output Configuration
      </Typography>
      
      <TextField
        fullWidth
        label="Output Placeholder"
        value={config.placeholder || 'Output will be generated based on query'}
        onChange={(e) => handleConfigChange('placeholder', e.target.value)}
        sx={{ mb: 2 }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={config.show_timestamps || false}
            onChange={(e) => handleConfigChange('show_timestamps', e.target.checked)}
          />
        }
        label="Show Timestamps"
        sx={{ mb: 2 }}
      />

      <FormControlLabel
        control={
          <Switch
            checked={config.show_usage || false}
            onChange={(e) => handleConfigChange('show_usage', e.target.checked)}
          />
        }
        label="Show Usage Information"
        sx={{ mb: 2 }}
      />
    </Box>
  );

  const renderConfig = () => {
    switch (component.componentType) {
      case 'user_query':
        return renderUserQueryConfig();
      case 'knowledge_base':
        return renderKnowledgeBaseConfig();
      case 'llm_engine':
        return renderLLMConfig();
      case 'output':
        return renderOutputConfig();
      default:
        return <Typography>No configuration available</Typography>;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {renderConfig()}
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button variant="outlined" onClick={() => onUpdate(config)}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Save Configuration
        </Button>
      </Box>
    </Box>
  );
};

export default ComponentConfig; 