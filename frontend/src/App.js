import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Components
import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';
import WorkflowBuilder from './components/WorkflowBuilder/WorkflowBuilder';
import ChatInterface from './components/Chat/ChatInterface';

// Create theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <Header />
                    <Box component="main" sx={{ flexGrow: 1 }}>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/workflow/:id" element={<WorkflowBuilder />} />
                            <Route path="/workflow/:id/chat" element={<ChatInterface />} />
                        </Routes>
                    </Box>
                </Box>
            </Router>
        </ThemeProvider>
    );
}

export default App; 