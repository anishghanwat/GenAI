import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Backdrop,
} from '@mui/material';
import {
  Add as AddIcon,
  Home as HomeIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { workflowAPI } from '../../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await workflowAPI.getWorkflows();
      setWorkflows(response.data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      setSnackbar({ open: true, message: 'Error loading workflows', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    if (!newWorkflowName.trim()) {
      setSnackbar({ open: true, message: 'Please enter a workflow name', severity: 'warning' });
      return;
    }

    try {
      const response = await workflowAPI.createWorkflow({
        name: newWorkflowName,
        description: newWorkflowDescription
      });
      setWorkflows([...workflows, response.data]);
      setDialogOpen(false);
      setNewWorkflowName('');
      setNewWorkflowDescription('');
      setSnackbar({ open: true, message: 'Workflow created successfully', severity: 'success' });
      navigate(`/workflow/${response.data.id}`);
    } catch (error) {
      console.error('Error creating workflow:', error);
      setSnackbar({ open: true, message: 'Error creating workflow', severity: 'error' });
    }
  };

  const handleDeleteWorkflow = async (workflowId) => {
    try {
      await workflowAPI.deleteWorkflow(workflowId);
      setWorkflows(workflows.filter(w => w.id !== workflowId));
      setSnackbar({ open: true, message: 'Workflow deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      setSnackbar({ open: true, message: 'Error deleting workflow', severity: 'error' });
    }
  };

  const handleRunWorkflow = async (workflowId) => {
    try {
      const response = await workflowAPI.validateWorkflow(workflowId);
      if (response.data.valid) {
        navigate(`/workflow/${workflowId}/chat`);
      } else {
        setSnackbar({
          open: true,
          message: 'Workflow validation failed. Please check your configuration.',
          severity: 'warning'
        });
      }
    } catch (error) {
      console.error('Error running workflow:', error);
      setSnackbar({ open: true, message: 'Error running workflow', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Loading workflows...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      padding: 0,
    }}>
      {/* Main Content */}
      <Box sx={{
        padding: '34px 54px 0 54px',
        maxWidth: '1440px',
        margin: '0 auto',
      }}>
        {/* Header Section */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}>
          <Typography
            variant="h4"
            sx={{
              fontSize: '24px',
              fontWeight: 600,
              lineHeight: '28px',
              letterSpacing: '-0.04em',
              color: '#0F172A',
            }}
          >
            My Stacks
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            sx={{
              backgroundColor: '#44924C',
              borderRadius: '8px',
              padding: '9px 15px',
              height: '40px',
              fontSize: '14px',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: '#FFFFFF',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#3a7a3f',
              },
            }}
          >
            New Stack
          </Button>
        </Box>

        {/* Divider */}
        <Box sx={{
          height: '2px',
          backgroundColor: '#E4E8EE',
          mb: 4,
        }} />

        {/* Content Area */}
        {workflows.length === 0 ? (
          /* Empty State - Centered Card */
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 200px)',
          }}>
            <Card
              sx={{
                width: '425px',
                height: '220px',
                borderRadius: '20px',
                border: '1px solid #E4E8EE',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '45px 50px',
              }}
            >
              <CardContent sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '25px',
                width: '100%',
                padding: 0,
              }}>
                {/* Title and Description */}
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'center',
                }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: '24px',
                      fontWeight: 600,
                      lineHeight: '29px',
                      color: '#000000',
                    }}
                  >
                    Create New Stack
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: '16px',
                      fontWeight: 500,
                      lineHeight: '24px',
                      color: '#666666',
                      maxWidth: '349px',
                    }}
                  >
                    Start building your generative AI apps with our essential tools and frameworks
                  </Typography>
                </Box>

                {/* Create Button */}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setDialogOpen(true)}
                  sx={{
                    backgroundColor: '#44924C',
                    borderRadius: '8px',
                    padding: '9px 15px',
                    height: '40px',
                    fontSize: '14px',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    color: '#FFFFFF',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#3a7a3f',
                    },
                  }}
                >
                  New Stack
                </Button>
              </CardContent>
            </Card>
          </Box>
        ) : (
          /* Workflows Grid */
          <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '30px',
            justifyContent: 'flex-start',
          }}>
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                sx={{
                  width: '311px',
                  height: '168px',
                  borderRadius: '10px',
                  border: '1px solid #E4E8EE',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px -1px 100px rgba(0, 0, 0, 0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '31px 28px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                }}
                onClick={() => navigate(`/workflow/${workflow.id}`)}
              >
                <CardContent sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  padding: 0,
                }}>
                  {/* Title and Description */}
                  <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '7px',
                  }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '16px',
                        fontWeight: 500,
                        lineHeight: '19px',
                        letterSpacing: '-0.02em',
                        color: '#000000',
                      }}
                    >
                      {workflow.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '14px',
                        fontWeight: 500,
                        lineHeight: '20px',
                        color: 'rgba(102, 102, 102, 0.75)',
                        maxWidth: '223px',
                      }}
                    >
                      {workflow.description || 'No description available'}
                    </Typography>
                  </Box>

                  {/* Edit Button */}
                  <Button
                    variant="outlined"
                    startIcon={<OpenIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/workflow/${workflow.id}`);
                    }}
                    sx={{
                      width: '110px',
                      height: '35px',
                      border: '1px solid #D5D5D5',
                      borderRadius: '5px',
                      fontSize: '14px',
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                      color: '#0F172A',
                      textTransform: 'none',
                      padding: '9px 10px',
                      '&:hover': {
                        borderColor: '#0F172A',
                        backgroundColor: 'rgba(15, 23, 42, 0.04)',
                      },
                    }}
                  >
                    Edit Stack
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Create Workflow Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            width: '542px',
            height: '431px',
            borderRadius: '10px',
            backgroundColor: '#FFFFFF',
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '19px 0',
        }}>
          {/* Header */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 18px',
            borderBottom: '1px solid #E3E8EF',
            paddingBottom: '12px',
          }}>
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: 600,
                lineHeight: '19px',
                color: '#000000',
              }}
            >
              Create New Stack
            </Typography>
            <IconButton
              onClick={() => setDialogOpen(false)}
              sx={{
                width: '12px',
                height: '12px',
                color: '#000000',
              }}
            >
              <CloseIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{
            flex: 1,
            padding: '19px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '19px',
          }}>
            {/* Name Field */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '17px',
                  color: '#444444',
                }}
              >
                Name
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                value={newWorkflowName}
                onChange={(e) => setNewWorkflowName(e.target.value)}
                placeholder="Enter stack name"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: '40px',
                    borderRadius: '5px',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    '& fieldset': {
                      border: 'none',
                    },
                  },
                }}
              />
            </Box>

            {/* Description Field */}
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              flex: 1,
            }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: '17px',
                  color: '#444444',
                }}
              >
                Description
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                multiline
                rows={6}
                value={newWorkflowDescription}
                onChange={(e) => setNewWorkflowDescription(e.target.value)}
                placeholder="Enter stack description"
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '5px',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    '& fieldset': {
                      border: 'none',
                    },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Footer */}
          <Box sx={{
            borderTop: '1px solid #E3E8EF',
            padding: '19px 18px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '25px',
            alignItems: 'center',
          }}>
            <Button
              onClick={() => setDialogOpen(false)}
              sx={{
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '17px',
                color: '#444444',
                textTransform: 'none',
                padding: 0,
                minWidth: 'auto',
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWorkflow}
              disabled={!newWorkflowName.trim()}
              sx={{
                width: '84px',
                height: '33px',
                backgroundColor: newWorkflowName.trim() ? '#44924C' : 'rgba(68, 146, 76, 0.2)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '17px',
                color: '#FFFFFF',
                textTransform: 'none',
                padding: '8px 13px',
                '&:hover': {
                  backgroundColor: newWorkflowName.trim() ? '#3a7a3f' : 'rgba(68, 146, 76, 0.2)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(68, 146, 76, 0.2)',
                  color: '#FFFFFF',
                },
              }}
            >
              Create
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard; 