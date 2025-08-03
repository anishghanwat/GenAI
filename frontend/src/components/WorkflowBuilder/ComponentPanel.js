import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Divider,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Upload as UploadIcon,
  SmartToy as LLMIcon,
  Output as OutputIcon,
  DragIndicator as DragIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';

const components = [
  {
    type: 'user_query',
    label: 'User Query',
    description: 'Entry point for user queries',
    icon: ChatIcon,
    color: '#1976d2',
  },
  {
    type: 'llm_engine',
    label: 'LLM (OpenAI)',
    description: 'Generate responses with AI models',
    icon: LLMIcon,
    color: '#f57c00',
  },
  {
    type: 'knowledge_base',
    label: 'Knowledge Base',
    description: 'Upload and process documents',
    icon: UploadIcon,
    color: '#388e3c',
  },
  {
    type: 'output',
    label: 'Output',
    description: 'Display final responses',
    icon: OutputIcon,
    color: '#7b1fa2',
  },
];

const ComponentPanel = ({ onAddComponent }) => {
  const handleDragStart = (event, componentType) => {
    event.dataTransfer.setData('application/reactflow', componentType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleAddComponent = (componentType) => {
    // Calculate position for new component
    const position = {
      x: Math.round(Math.random() * 400 + 100),
      y: Math.round(Math.random() * 300 + 100),
    };
    onAddComponent(componentType, position);
  };

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid #E4E8EE',
      width: '230px',
    }}>
      {/* Chat With AI Header */}
      <Box sx={{
        p: 2,
        borderBottom: '1px solid #E4E8EE',
        backgroundColor: '#F6F6F6',
        borderRight: '1px solid #E4E8EE',
        borderRadius: '8px 0 0 0',
      }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: '16px',
              fontWeight: 500,
              color: '#000000',
              letterSpacing: '-0.02em',
            }}
          >
            Chat With AI
          </Typography>
          <FolderIcon sx={{ color: '#000000', fontSize: 18 }} />
        </Box>
      </Box>

      {/* Components Section */}
      <Box sx={{ p: 2, borderBottom: '1px solid #E4E8EE' }}>
        <Typography
          variant="body2"
          sx={{
            fontSize: '14px',
            fontWeight: 400,
            color: '#000000',
            letterSpacing: '-0.02em',
            mb: 2,
          }}
        >
          Components
        </Typography>
      </Box>

      {/* Component List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List sx={{ p: 0 }}>
          {components.map((component, index) => (
            <React.Fragment key={component.type}>
              <ListItem
                button
                draggable
                onDragStart={(event) => handleDragStart(event, component.type)}
                onClick={() => handleAddComponent(component.type)}
                sx={{
                  borderRadius: '5px',
                  mb: 1,
                  border: '0.8px solid #94A3B8',
                  backgroundColor: '#FFFFFF',
                  height: '35px',
                  padding: '9px',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: component.color,
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                  <Box
                    sx={{
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <component.icon sx={{
                      color: '#444444',
                      fontSize: 16,
                    }} />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={component.label}
                  primaryTypographyProps={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#444444',
                    lineHeight: '17px',
                  }}
                  sx={{ flex: 1 }}
                />
                <DragIcon sx={{
                  color: '#9EACBF',
                  fontSize: 15,
                }} />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Bottom text */}
      <Box sx={{ p: 2, borderTop: '1px solid #E4E8EE' }}>
        <Typography
          variant="caption"
          sx={{
            color: '#000000',
            textAlign: 'center',
            display: 'block',
            fontSize: '12px',
          }}
        >
          Drag & drop to get started
        </Typography>
      </Box>
    </Box>
  );
};

export default ComponentPanel; 