# ☁️ Cloud Resource Access Request System (CRARS)

Welcome to the Cloud Resource Access Request System! This project is a full-stack application that allows users to request access to Azure resources and enables administrators to approve or reject those requests with automatic RBAC (Role-Based Access Control) assignment using Azure SDK.
Please find working dashboard screenshots in a seperate folder in the repo

---

## 📦 Project Overview

A hands-on project that:

- Uses **Terraform** to provision core Azure infrastructure
- Hosts a **Node.js (Express)** backend with Azure SDK integration
- Features a **React.js** frontend with a modern UI for users and admins
- Implements **Azure RBAC** role assignments dynamically
- Provides **audit logging** and **role validation**

---

## 🗂️ Repository Structure

backend/ # Express API server

   -app.js # Main RBAC logic and endpoints
   
   -.env.example # Sample environment config
   
   -Dockerfile # Backend container config
   
access-request-frontend/ # React frontend

   -src/ # React components
   
   -package.json # Frontend dependencies
   
   -*.tf # Terraform infrastructure files

---

## 🚀 Features

### 🌐 User Portal

- Simple form to request access to Azure subscriptions
- Role selection: Reader, Contributor, Owner
- Justification field for approvals

### 🔒 Admin Dashboard

- View pending requests
- Approve with automatic Azure RBAC assignment
- Reject with reason tracking
- Audit trail for every action

### ⚙️ Azure RBAC Integration

- Uses `@azure/arm-authorization` SDK
- Supports assigning built-in roles via Azure API
- UUID (`uuidv4()`) used to generate unique role assignment IDs

### 📊 Infrastructure Monitoring

- Log Analytics Workspace for centralized logging
- Cost alerting using Azure Monitor

---

## ⚙️ Setup Instructions


1. Clone the project
   
git clone "https://github.com/anushkaapandeyy/Azure"

2. Configure Environment Variables
cd backend

cd .env

 3. Edit .env with:
 
 AZURE_SUBSCRIPTION_ID, USER_PRINCIPAL_ID (or implement lookup)
 
 COSMOS_DB_ENDPOINT, COSMOS_DB_KEY

 4. Install Dependencies

 Backend

cd backend

npm install

 Frontend
 
cd ../access-request-frontend

npm install

5. Authenticate with Azure
   
az login

az account set --subscription <your-subscription-id>

6. Deploy Azure Infra
   
terraform init

terraform plan

terraform apply

7. Start the App
 
 Backend

cd backend

npm start

Frontend (in new terminal)

cd access-request-frontend

npm start


📌 Role Assignment Details

Role Definitions Supported

Role	             Definition ID

Reader	           acdd72a7-3385-48ef-bd42-f606fba81ae7

Contributor	       b24988ac-6180-42a0-ab88-20f7382dd24c

Owner	             8e3af657-a8ff-443c-a75c-2fe8c4bcb635

# Why UUID is Used - 

Each role assignment in Azure requires a unique ID

The backend uses uuidv4() to generate this ID when creating assignments

This is not the user ID or role ID — it is the role assignment object's ID, which is a unique identifier required by Azure to track each role assignment independently.

The Azure SDK (@azure/arm-authorization) is used to make authorized API calls to Azure, allowing us to:

Create RBAC assignments programmatically

Pass the UUID as the roleAssignmentName in the roleAssignments.create() method

Provide the necessary scope, principalId, and roleDefinitionId

Additionally, this project uses Azure Cosmos DB as the backend database to store access requests. 

# Cosmos DB stores details like:

User ID

Requested Role

Subscription ID

Justification

Status (pending, approved, rejected)

Timestamps and audit metadata

Cosmos DB is ideal here due to its flexible schema, low latency, and global availability, making it perfect for scalable access tracking.

# Security Practices
CORS enabled for frontend-backend communication

Input validation on API endpoints

Logging of actions for audit trail

Admin-only actions protected (authentication recommended in production)

# Testing
Submitting a Request

Fill the form in the user portal and submit

Approving a Request

Switch to admin dashboard

Approve the request to trigger Azure role assignment

Rejecting a Request

Reject with an optional reason

# Troubleshooting

Issue	Solution

USER_PRINCIPAL_ID not set	Set manually or implement email-to-ID lookup via Microsoft Graph

RBAC assignment failed	Ensure service principal has "User Access Administrator" role

Cosmos DB errors	Check connection string in .env

CORS issues	Confirm backend has CORS enabled (dev mode allows all origins)


📈 Success Criteria

✅ Users can request access with proper validation

✅ Admins can approve and assign Azure RBAC roles

✅ Terraform successfully provisions infrastructure

✅ Cosmos DB stores all access requests

✅ Modern, responsive UI works across devices

🙌 Acknowledgements

Azure SDK for JavaScript

Microsoft Learn & Docs

Open source Terraform modules

