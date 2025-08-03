import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from 'react-flow-renderer';
import {
  Box,
  Paper,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Chat as ChatIcon,
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  Upload as UploadIcon,
  SmartToy as LLMIcon,
  Output as OutputIcon,
} from '@mui/icons-material';
import { workflowAPI } from '../../services/api';
import ComponentPanel from './ComponentPanel';
import ComponentConfig from './ComponentConfig';
import CustomNode from './CustomNode';

const nodeTypes = {
  custom: CustomNode,
};

const WorkflowBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchWorkflow();
  }, [id]);

  const fetchWorkflow = async () => {
    try {
      setLoading(true);
      const response = await workflowAPI.getWorkflow(id);
      setWorkflow(response.data);

      // Convert components to nodes
      const workflowNodes = response.data.components.map((component, index) => ({
        id: component.id.toString(),
        type: 'custom',
        position: { x: component.position_x || 100 + index * 200, y: component.position_y || 100 },
        data: {
          label: component.component_type.replace('_', ' ').toUpperCase(),
          componentType: component.component_type,
          configuration: component.configuration || {},
          id: component.id,
        },
      }));

      setNodes(workflowNodes);
    } catch (error) {
      console.error('Error fetching workflow:', error);
      setSnackbar({ open: true, message: 'Error loading workflow', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setConfigOpen(true);
  }, []);

  const handleAddComponent = async (componentType, position) => {
    try {
      const response = await workflowAPI.addComponent(id, {
        component_type: componentType,
        position_x: Math.round(position.x),
        position_y: Math.round(position.y),
      });

      const newNode = {
        id: response.data.id.toString(),
        type: 'custom',
        position,
        data: {
          label: componentType.replace('_', ' ').toUpperCase(),
          componentType,
          configuration: response.data.configuration || {},
          id: response.data.id,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      setSnackbar({ open: true, message: 'Component added successfully', severity: 'success' });
    } catch (error) {
      console.error('Error adding component:', error);
      setSnackbar({ open: true, message: 'Error adding component', severity: 'error' });
    }
  };

  const handleUpdateComponent = async (nodeId, configuration) => {
    try {
      await workflowAPI.updateComponent(parseInt(nodeId), { configuration });
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, configuration } }
            : node
        )
      );
      setSnackbar({ open: true, message: 'Component updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error updating component:', error);
      setSnackbar({ open: true, message: 'Error updating component', severity: 'error' });
    }
  };

  const handleValidateWorkflow = async () => {
    try {
      const response = await workflowAPI.validateWorkflow(id);
      const { valid, errors, warnings } = response.data;

      if (valid) {
        setSnackbar({ open: true, message: 'Workflow is valid!', severity: 'success' });
      } else {
        setSnackbar({
          open: true,
          message: `Workflow validation failed: ${errors.join(', ')}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error validating workflow:', error);
      setSnackbar({ open: true, message: 'Error validating workflow', severity: 'error' });
    }
  };

  const handleSaveWorkflow = async () => {
    try {
      // Save node positions
      for (const node of nodes) {
        await workflowAPI.updateComponent(parseInt(node.id), {
          position_x: node.position.x,
          position_y: node.position.y,
        });
      }
      setSnackbar({ open: true, message: 'Workflow saved successfully', severity: 'success' });
    } catch (error) {
      console.error('Error saving workflow:', error);
      setSnackbar({ open: true, message: 'Error saving workflow', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">Loading workflow...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      height: 'calc(100vh - 55px)',
      backgroundColor: '#FFFFFF',
    }}>
      {/* Component Panel */}
      <Box sx={{
        width: '230px',
        flexShrink: 0,
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E4E8EE',
      }}>
        <ComponentPanel onAddComponent={handleAddComponent} />
      </Box>

      {/* Main Canvas */}
      <Box sx={{
        flexGrow: 1,
        position: 'relative',
        backgroundColor: '#FFFFFF',
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          style={{
            backgroundColor: '#FFFFFF',
          }}
        >
          <Controls
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '6px',
              boxShadow: '0px 3px 12px rgba(0, 0, 0, 0.04)',
            }}
          />
          <Background
            color="#e0e0e0"
            gap={20}
            size={1}
          />
          <MiniMap
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '6px',
              boxShadow: '0px 3px 12px rgba(0, 0, 0, 0.04)',
            }}
          />
        </ReactFlow>

        {/* Action Buttons */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayIcon />}
            onClick={handleValidateWorkflow}
            sx={{
              backgroundColor: '#FFFFFF',
              color: '#000000',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0px 3px 12px rgba(0, 0, 0, 0.04)',
              borderRadius: '6px',
              padding: '10px 24px 10px 12px',
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            Build Stack
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ChatIcon />}
            onClick={() => navigate(`/workflow/${id}/chat`)}
            sx={{
              backgroundColor: '#FFFFFF',
              color: '#000000',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0px 3px 12px rgba(0, 0, 0, 0.04)',
              borderRadius: '6px',
              padding: '10px 24px 10px 12px',
              fontSize: '14px',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            Chat with Stack
          </Button>
        </Box>
      </Box>

      {/* Component Configuration Dialog */}
      <Dialog
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Configure {selectedNode?.data?.label}
        </DialogTitle>
        <DialogContent>
          {selectedNode && (
            <ComponentConfig
              component={selectedNode.data}
              onUpdate={(configuration) => {
                handleUpdateComponent(selectedNode.id, configuration);
                setConfigOpen(false);
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigOpen(false)}>Cancel</Button>
        </DialogActions>
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

export default WorkflowBuilder; 