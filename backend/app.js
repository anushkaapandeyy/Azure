require('dotenv').config();
const express = require('express');
const cors = require('cors');// Enable cross-origin requests (frontend ↔ backend)
const { CosmosClient } = require('@azure/cosmos');// Azure Cosmos DB client
const { DefaultAzureCredential } = require('@azure/identity');// Azure authentication SDK

const app = express();
const port = process.env.PORT || 3000;

// Initialize Cosmos DB client SDK
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY,
});

const database = cosmosClient.database(process.env.COSMOS_DB_DATABASE);
const container = database.container(process.env.COSMOS_DB_CONTAINER);

// Middleware
app.use(cors()); // Enable CORS for all routes allow frontend to talk to backend
app.use(express.json());//parse json from requests to javascript objects

// Health check endpoint to check if server is running, returns time and status
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
  const { email, subscription, role, justification } = req.body; //extract form data
  
  if (!email || !subscription || !role || !justification) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['email', 'subscription', 'role', 'justification']
    });
  }
//create new object
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
    await container.items.create(newItem); //save to cosmos db
    res.status(201).json({                 //return response
      message: 'Access request submitted successfully!',
      ...newItem
    });
  } catch (error) {
    console.error('Error storing request:', error);
    res.status(500).json({ error: 'Failed to store the request' });
  }
});

// Get all requests by admin board
app.get('/api/requests', async (req, res) => {
  try {
    const { resources } = await container.items.readAll().fetchAll(); //get all req from cosmosdb
    res.json({ requests: resources });                                //return them as json array
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get a specific request by ID
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
  const { requestId, approverId } = req.body; // Get request ID and who's approving

  if (!requestId || !approverId) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['requestId', 'approverId']
    });
  }

  try {
    const { resource: request } = await container.item(requestId).read();  //find the request

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Request is not pending approval' });
    }

    console.log(`Assigning role ${request.role} to ${request.email}...`);
    
    // Azure RBAC role assignment implementation
    try {
      const { AuthorizationManagementClient } = require('@azure/arm-authorization'); //SDK Client calling
      const { v4: uuidv4 } = require('uuid'); //Universally unique Identifier
      //azure needs unique name for each role assignment
      
      const credential = new DefaultAzureCredential();//authentication
      const authClient = new AuthorizationManagementClient(//rbac client
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
      //validate the role
      if (!roleDefinitionId) {
        throw new Error(`Unsupported role: ${request.role}. Supported roles: ${Object.keys(roleDefinitionIds).join(', ')}`);
      }
      
      // In a real implementation, you would resolve the user's Principal ID from their email
      // For now,   I am using a placeholder that should be replaced with actual user lookup
      const userPrincipalId = process.env.USER_PRINCIPAL_ID || 'USER_PRINCIPAL_ID_PLACEHOLDER';
      //ries to get the user’s Azure AD Object ID (Principal ID).
      //If not found (still set to placeholder), logs a warning and marks it as a simulated assignment.


      if (userPrincipalId === 'USER_PRINCIPAL_ID_PLACEHOLDER') {
        console.warn('USER_PRINCIPAL_ID not set in environment variables. Role assignment will be simulated.');
        request.simulatedAssignment = true;
      } else {
        // Check if role assignment already exists
        console.log(`Checking existing role assignments for user ${userPrincipalId}...`);
        
        try {
          const existingAssignments = [];//loops thru all existing rbac at sub level
          //checks if it already exists
          for await (const assignment of authClient.roleAssignments.listForScope(scope)) {
            if (assignment.principalId === userPrincipalId && assignment.roleDefinitionId === roleDefinitionId) {
              existingAssignments.push(assignment);
            }
          }
          //if it exists
          if (existingAssignments.length > 0) {
            console.log(`Role ${request.role} already assigned to user ${request.email}. Using existing assignment.`);
            request.roleAssignmentId = existingAssignments[0].name;
            request.existingAssignment = true;
          } else {
            // Create new role assignment generates a new UUID for assignment name, new assignment creation using authClient
            const roleAssignmentName = uuidv4();
            //UUID Passsed in SDK when creating rbac
            console.log(`Creating new role assignment: ${roleAssignmentName}`);
            //The code is using the Azure SDK for JavaScript/TypeScript, specifically the @azure/arm-authorization package.
            //This SDK allows your code to manage RBAC roles via Node.js code.
            //assign the Reader role (roleDefinitionId) to this user (principalId) on this subscription (scope), 
            // and track this with a new Role Assignment ID (roleAssignmentName).”
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
    await container.item(requestId).replace(request); //save to db

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
