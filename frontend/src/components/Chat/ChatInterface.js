import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  CircularProgress,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { chatAPI } from '../../services/api';

const ChatInterface = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    createNewSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewSession = async () => {
    try {
      const response = await chatAPI.createSession();
      setSessionId(response.data.session_id);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(id, inputMessage, sessionId);
      
      if (response.data.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: response.data.response,
          timestamp: new Date(),
          model: response.data.model,
          usage: response.data.usage,
          processingTime: response.data.processing_time,
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'error',
          content: response.data.error || 'An error occurred',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Failed to send message. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const renderMessage = (message) => {
    const isUser = message.type === 'user';
    const isError = message.type === 'error';

    return (
      <Box
        key={message.id}
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isUser ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            maxWidth: '70%',
          }}
        >
          <Avatar
            sx={{
              bgcolor: isUser ? 'primary.main' : isError ? 'error.main' : 'secondary.main',
              width: 32,
              height: 32,
              mr: isUser ? 0 : 1,
              ml: isUser ? 1 : 0,
            }}
          >
            {isUser ? <PersonIcon /> : isError ? <BotIcon /> : <BotIcon />}
          </Avatar>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              backgroundColor: isUser ? 'primary.main' : isError ? 'error.light' : 'grey.100',
              color: isUser ? 'white' : 'text.primary',
              borderRadius: 2,
              maxWidth: '100%',
            }}
          >
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>
            
            {message.model && (
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={message.model}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
                {message.processingTime && (
                  <Chip
                    label={`${message.processingTime}ms`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                )}
                {message.usage && (
                  <Chip
                    label={`${message.usage.total_tokens} tokens`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            )}
            
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 1,
                opacity: 0.7,
                textAlign: isUser ? 'right' : 'left',
              }}
            >
              {formatTimestamp(message.timestamp)}
            </Typography>
          </Paper>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            ai
          </Typography>
        </Box>
        <Typography variant="h6">GenAI Stack Chat</Typography>
        <IconButton
          size="small"
          onClick={createNewSession}
          sx={{ ml: 'auto' }}
        >
          <RefreshIcon />
        </IconButton>
      </Paper>

      {/* Messages */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          backgroundColor: 'background.default',
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '24px',
                }}
              >
                ai
              </Typography>
            </Box>
            <Typography variant="h6" gutterBottom>
              GenAI Stack Chat
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start a conversation to test your stack
            </Typography>
          </Box>
        ) : (
          messages.map(renderMessage)
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                <BotIcon />
              </Avatar>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Thinking...
                </Typography>
              </Paper>
            </Box>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Send a message"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            multiline
            maxRows={4}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
            sx={{ alignSelf: 'flex-end' }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatInterface; 