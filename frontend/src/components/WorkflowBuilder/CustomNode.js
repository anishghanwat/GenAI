import React from 'react';
import { Handle, Position } from 'react-flow-renderer';
import {
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Chat as ChatIcon,
  Upload as UploadIcon,
  SmartToy as LLMIcon,
  Output as OutputIcon,
} from '@mui/icons-material';

const getComponentIcon = (componentType) => {
  switch (componentType) {
    case 'user_query':
      return ChatIcon;
    case 'knowledge_base':
      return UploadIcon;
    case 'llm_engine':
      return LLMIcon;
    case 'output':
      return OutputIcon;
    default:
      return ChatIcon;
  }
};

const getComponentColor = (componentType) => {
  switch (componentType) {
    case 'user_query':
      return '#FFC64C';
    case 'knowledge_base':
      return '#FF7A38';
    case 'llm_engine':
      return '#6344BE';
    case 'output':
      return '#50DF5F';
    default:
      return '#FFC64C';
  }
};

const getHandlePositions = (componentType) => {
  switch (componentType) {
    case 'user_query':
      return {
        outputs: [{ position: Position.Bottom, label: 'Query', color: '#FFC64C' }]
      };
    case 'knowledge_base':
      return {
        inputs: [{ position: Position.Left, label: 'Query', color: '#FF7A38' }],
        outputs: [{ position: Position.Right, label: 'Context', color: '#FF7A38' }]
      };
    case 'llm_engine':
      return {
        inputs: [
          { position: Position.Left, label: 'Query', color: '#6344BE' },
          { position: Position.Left, label: 'Context', color: '#6344BE', offset: 20 }
        ],
        outputs: [{ position: Position.Bottom, label: 'Output', color: '#6344BE' }]
      };
    case 'output':
      return {
        inputs: [{ position: Position.Left, label: 'Output', color: '#50DF5F' }]
      };
    default:
      return { outputs: [{ position: Position.Bottom, label: 'Output', color: '#FFC64C' }] };
  }
};

const CustomNode = ({ data, selected }) => {
  const IconComponent = getComponentIcon(data.componentType);
  const handleColor = getComponentColor(data.componentType);
  const handlePositions = getHandlePositions(data.componentType);

  return (
    <Box
      sx={{
        width: '303px',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
        border: selected ? '2px solid #1976d2' : 'none',
        position: 'relative',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          height: '43px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #D9D9D9',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          position: 'relative',
        }}
      >
        <IconComponent
          sx={{
            color: '#000000',
            fontSize: 16,
            mr: 2,
          }}
        />
        <Typography
          sx={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#000000',
            flex: 1,
          }}
        >
          {data.label}
        </Typography>
        <IconButton
          size="small"
          sx={{
            width: 18,
            height: 18,
            color: '#000000',
          }}
        >
          <SettingsIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Subtitle */}
      <Box
        sx={{
          height: '38px',
          backgroundColor: '#EDF3FF',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
        }}
      >
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 400,
            color: '#000000',
          }}
        >
          {data.componentType === 'user_query' && 'Enter point for querys'}
          {data.componentType === 'knowledge_base' && 'Let LLM search info in your file'}
          {data.componentType === 'llm_engine' && 'Run a query with OpenAI LLM'}
          {data.componentType === 'output' && 'Output of the result nodes as text'}
        </Typography>
      </Box>

      {/* Content Area */}
      <Box
        sx={{
          padding: '16px',
          minHeight: '100px',
        }}
      >
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 400,
            color: '#000000',
            mb: 1,
          }}
        >
          {data.componentType === 'user_query' && 'User Query'}
          {data.componentType === 'knowledge_base' && 'File for Knowledge Base'}
          {data.componentType === 'llm_engine' && 'Model'}
          {data.componentType === 'output' && 'Output Text'}
        </Typography>

        <Box
          sx={{
            width: '271px',
            height: '71.59px',
            border: '1px solid rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            backgroundColor: data.componentType === 'output' ? '#F6F6F6' : '#FFFFFF',
          }}
        >
          <Typography
            sx={{
              fontSize: data.componentType === 'output' ? '12px' : '14px',
              fontWeight: 400,
              color: 'rgba(0, 0, 0, 0.5)',
            }}
          >
            {data.componentType === 'user_query' && 'Write your query here'}
            {data.componentType === 'knowledge_base' && 'Upload File'}
            {data.componentType === 'llm_engine' && 'GPT 4o- Mini'}
            {data.componentType === 'output' && 'Output will be generated based on query'}
          </Typography>
        </Box>
      </Box>

      {/* Handles */}
      {handlePositions.inputs?.map((handle, index) => (
        <Handle
          key={`input-${index}`}
          type="target"
          position={handle.position}
          style={{
            background: handle.color,
            width: 8,
            height: 8,
            border: '1px solid white',
            left: handle.offset ? handle.offset : undefined,
          }}
        />
      ))}

      {handlePositions.outputs?.map((handle, index) => (
        <Handle
          key={`output-${index}`}
          type="source"
          position={handle.position}
          style={{
            background: handle.color,
            width: 8,
            height: 8,
            border: '1px solid white',
          }}
        />
      ))}
    </Box>
  );
};

export default CustomNode; 