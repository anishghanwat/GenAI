import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isWorkflowPage = location.pathname.includes('/workflow/');

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E4E8EE',
        height: '55px',
      }}
    >
      <Toolbar sx={{ height: '55px', padding: '0 17px', justifyContent: 'space-between' }}>
        {/* Left side - Logo, Title, and Home Icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Home Icon (only show on workflow pages) */}
          {isWorkflowPage && (
            <IconButton
              onClick={() => navigate('/')}
              sx={{
                width: '18px',
                height: '18px',
                color: '#000000',
                mr: 1,
              }}
            >
              <HomeIcon sx={{ fontSize: 18 }} />
            </IconButton>
          )}

          {/* Logo */}
          <Box
            sx={{
              width: '25px',
              height: '25px',
              backgroundColor: '#1976d2',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              sx={{
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              G
            </Typography>
          </Box>

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              color: '#0F172A',
              fontSize: '18px',
              fontWeight: 600,
              lineHeight: '22px',
              letterSpacing: '-0.03em',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            GenAI Stack
          </Typography>
        </Box>

        {/* Right side buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Save Button (only show on workflow pages) */}
          {isWorkflowPage && (
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              sx={{
                height: '30px',
                padding: '5px 15px',
                border: '1px solid rgba(0, 0, 0, 0.25)',
                borderRadius: '6px',
                color: '#444444',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  border: '1px solid rgba(0, 0, 0, 0.4)',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                },
              }}
            >
              Save
            </Button>
          )}

          {/* User Profile */}
          <Avatar
            sx={{
              width: '30px',
              height: '30px',
              backgroundColor: '#B0ACE9',
              fontSize: '14px',
              fontWeight: 500,
              color: '#FFFFFF',
            }}
          >
            S
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 