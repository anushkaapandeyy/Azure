require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { CosmosClient } = require('@azure/cosmos');
const { DefaultAzureCredential } = require('@azure/identity');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Cosmos DB client
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY,
});

const database = cosmosClient.database(process.env.COSMOS_DB_DATABASE);
const container = database.container(process.env.COSMOS_DB_CONTAINER);

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'CRARS Backend'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'CRARS Backend API is running!', 
    version: '1.0.0'
  });
});

// Access request endpoint
app.post('/api/request', async (req, res) => {
  const { email, subscription, role, justification } = req.body;
  
  if (!email || !subscription || !role || !justification) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['email', 'subscription', 'role', 'justification']
    });
  }

  const newItem = {
    id: `REQ-${Date.now()}`,
    email,
    subscription,
    role,
    justification,
    status: 'pending',
    timestamp: new Date().toISOString(),
  };

  try {
    await container.items.create(newItem);
    res.status(201).json({
      message: 'Access request submitted successfully!',
      ...newItem
    });
  } catch (error) {
    console.error('Error storing request:', error);
    res.status(500).json({ error: 'Failed to store the request' });
  }
});

// Get all requests
app.get('/api/requests', async (req, res) => {
  try {
    const { resources } = await container.items.readAll().fetchAll();
    res.json({ requests: resources });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get specific request by ID
app.get('/api/request/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const { resource: request } = await container.item(id).read();
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json({ request });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

app.post('/api/request/approve', async (req, res) => {
  const { requestId, approverId } = req.body;

  if (!requestId || !approverId) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['requestId', 'approverId']
    });
  }

  try {
    const { resource: request } = await container.item(requestId).read();

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending approval' });
    }

    console.log(`Assigning role ${request.role} to ${request.email}...`);
    // TODO: Add actual Azure RBAC role assignment logic here
    
    request.status = 'approved';
    request.approvedBy = approverId;
    request.approvedAt = new Date().toISOString();
    await container.item(requestId).replace(request);

    res.json({ message: 'Request approved and role assigned', request });

  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ error: 'Failed to approve the request' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`CRARS Backend running on port ${port}`);
});
