const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

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
app.post('/api/request', (req, res) => {
  const { email, subscription, role, justification } = req.body;
  
  // Log the request (in production, you'd save this to a database)
  console.log('New access request received:', {
    email,
    subscription,
    role,
    justification,
    timestamp: new Date().toISOString()
  });
  
  // Validate required fields
  if (!email || !subscription || !role || !justification) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['email', 'subscription', 'role', 'justification']
    });
  }
  
  // Simulate processing and return success
  res.status(201).json({ 
    message: 'Access request submitted successfully!',
    requestId: `REQ-${Date.now()}`,
    status: 'pending'
  });
});

// Start server
app.listen(port, () => {
  console.log(`CRARS Backend running on port ${port}`);
});
