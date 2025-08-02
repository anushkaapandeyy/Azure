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
    
    // Azure RBAC role assignment implementation
    try {
      const { AuthorizationManagementClient } = require('@azure/arm-authorization');
      const { v4: uuidv4 } = require('uuid');
      
      const credential = new DefaultAzureCredential();
      const authClient = new AuthorizationManagementClient(
        credential,
        process.env.AZURE_SUBSCRIPTION_ID
      );
      
      // Define role definition IDs for common Azure roles
      const roleDefinitionIds = {
        'Reader': '/subscriptions/' + process.env.AZURE_SUBSCRIPTION_ID + '/providers/Microsoft.Authorization/roleDefinitions/acdd72a7-3385-48ef-bd42-f606fba81ae7',
        'Contributor': '/subscriptions/' + process.env.AZURE_SUBSCRIPTION_ID + '/providers/Microsoft.Authorization/roleDefinitions/b24988ac-6180-42a0-ab88-20f7382dd24c',
        'Owner': '/subscriptions/' + process.env.AZURE_SUBSCRIPTION_ID + '/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635'
      };
      
      const scope = `/subscriptions/${process.env.AZURE_SUBSCRIPTION_ID}`;
      const roleDefinitionId = roleDefinitionIds[request.role];
      
      if (!roleDefinitionId) {
        throw new Error(`Unsupported role: ${request.role}. Supported roles: ${Object.keys(roleDefinitionIds).join(', ')}`);
      }
      
      // In a real implementation, you would resolve the user's Principal ID from their email
      // For now, we'll use a placeholder that should be replaced with actual user lookup
      const userPrincipalId = process.env.USER_PRINCIPAL_ID || 'USER_PRINCIPAL_ID_PLACEHOLDER';
      
      if (userPrincipalId === 'USER_PRINCIPAL_ID_PLACEHOLDER') {
        console.warn('USER_PRINCIPAL_ID not set in environment variables. Role assignment will be simulated.');
        request.simulatedAssignment = true;
      } else {
        // Check if role assignment already exists
        console.log(`Checking existing role assignments for user ${userPrincipalId}...`);
        
        try {
          const existingAssignments = [];
          for await (const assignment of authClient.roleAssignments.listForScope(scope)) {
            if (assignment.principalId === userPrincipalId && assignment.roleDefinitionId === roleDefinitionId) {
              existingAssignments.push(assignment);
            }
          }
          
          if (existingAssignments.length > 0) {
            console.log(`Role ${request.role} already assigned to user ${request.email}. Using existing assignment.`);
            request.roleAssignmentId = existingAssignments[0].name;
            request.existingAssignment = true;
          } else {
            // Create new role assignment
            const roleAssignmentName = uuidv4();
            console.log(`Creating new role assignment: ${roleAssignmentName}`);
            
            await authClient.roleAssignments.create(scope, roleAssignmentName, {
              roleDefinitionId: roleDefinitionId,
              principalId: userPrincipalId,
              principalType: 'User'
            });
            
            console.log(`Successfully assigned ${request.role} role to ${request.email}`);
            request.roleAssignmentId = roleAssignmentName;
          }
        } catch (listError) {
          console.warn('Could not check existing assignments:', listError.message);
          // Try to create assignment anyway
          const roleAssignmentName = uuidv4();
          await authClient.roleAssignments.create(scope, roleAssignmentName, {
            roleDefinitionId: roleDefinitionId,
            principalId: userPrincipalId,
            principalType: 'User'
          });
          
          console.log(`Successfully assigned ${request.role} role to ${request.email}`);
          request.roleAssignmentId = roleAssignmentName;
        }
      }
      
    } catch (rbacError) {
      console.error('RBAC assignment failed:', rbacError);
      // Continue with approval but log the RBAC failure
      request.rbacError = rbacError.message;
      request.rbacAssignmentFailed = true;
    }
    
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

// Reject request endpoint
app.post('/api/request/reject', async (req, res) => {
  const { requestId, approverId, rejectionReason } = req.body;

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

    request.status = 'rejected';
    request.rejectedBy = approverId;
    request.rejectedAt = new Date().toISOString();
    request.rejectionReason = rejectionReason || 'No reason provided';
    
    await container.item(requestId).replace(request);

    res.json({ message: 'Request rejected successfully', request });

  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: 'Failed to reject the request' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`CRARS Backend running on port ${port}`);
});
