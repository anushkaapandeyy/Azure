# ☁️ Azure - Hands-On Project 🚀

Welcome! This repository documents a hands-on learning project for creating and managing Azure resources using Terraform and the Azure CLI.

---

## 🔧 Step-by-Step Deployments

### 1️⃣ Resource Group (RG) Creation
- 📁 **Resource Group Name**: `myResourceGroup`  
- 🆓 **Deployed Under**: Free Trial Subscription  
- 🆔 **Subscription ID**: `75a79bec-3e88-4d48-99c4-d17a605f94c0`

---

### 2️⃣ Virtual Network (VNet)
- 🌐 **Name**: `myVirtualNetwork`  
- 📍 **Address Space**: `10.0.0.0/16`  
- 📦 **Resource Group**: `myResourceGroup`

---

### 3️⃣ Subnet Deployment
- 🧱 **Name**: `mySubnet`  
- 📍 **Address Range**: `10.0.128.0/20`  
- 🌐 **Parent VNet**: `myVirtualNetwork`

---

### 4️⃣ Network Security Groups (NSG)
- 🛡️ **Purpose**: Virtual firewall controlling network traffic to/from Azure resources
- 🔒 **Security Layer**: Application-level traffic filtering for subnets and network interfaces
- 📍 **Location**: Associated with subnets and individual VMs for granular control

#### 🚦 Security Rules Configuration:

##### **Inbound Rules** (Traffic Coming IN):
- 🌐 **HTTP (Port 80)**: Allows web traffic from internet to web servers
  - Priority: `1001` | Protocol: `TCP` | Source: `*` (Any)
  - Use Case: Public website access, load balancer health checks

- 🔐 **HTTPS (Port 443)**: Allows secure web traffic with SSL/TLS encryption
  - Priority: `1002` | Protocol: `TCP` | Source: `*` (Any)
  - Use Case: Secure web applications, API endpoints, e-commerce

- 🔑 **SSH (Port 22)**: Allows secure remote access to Linux servers
  - Priority: `1003` | Protocol: `TCP` | Source: `Admin IPs Only`
  - ⚠️ **Security Note**: Should be restricted to admin networks, not `*`

##### **Best Practice Priority Ranges**:
- `100-199`: Critical security/deny rules
- `200-999`: Specific allow rules (SSH, database access)
- `1000-1999`: Application-specific ports
- `2000-2999`: Internal network communication
- `3000-3999`: Monitoring and management
- `4000-4096`: Catch-all deny rules

#### 🔄 NSG Association:
```hcl
# Associate NSG with subnet
resource "azurerm_subnet_network_security_group_association" "main" {
  subnet_id                 = azurerm_subnet.my_subnet.id
  network_security_group_id = azurerm_network_security_group.main.id
}
```

#### 🛠️ Common Use Cases:
- **Web Tier**: Allow HTTP/HTTPS from internet, SSH from admin networks
- **App Tier**: Allow application ports from web tier only
- **Database Tier**: Allow database ports from app tier, deny internet access
- **Management**: Allow SSH/RDP from admin networks for troubleshooting

#### 🔍 Protocol Selection:
- **TCP**: Web traffic, databases, file transfers (reliable, ordered delivery)
- **UDP**: DNS queries, NTP time sync (fast, simple requests)
- **ICMP**: Network diagnostics, ping, traceroute

---

### 5️⃣ Azure Kubernetes Service (AKS) Cluster
- ☸️ **Cluster Name**: `myAKSCluster`  
- 🆔 **Identity Type**: System Assigned (used to access other Azure resources like Key Vaults)  

#### ⛓️ Automatically Created Infrastructure:
- 🌀 **Load Balancer**: `kubernetes` (Handles outbound NAT for cluster)
- 🌍 **Public IP**: `e5289029-447c-4d11-88c8-635394b05a21` (Allows image downloads & API communication)
- 🔐 **NSG**: `aks-agentpool-14693408-nsg` (Controls traffic rules and node communication)
- 🖥️ **VM Scale Set**: `aks-default-22151992-vmss` (Provides autoscaling for worker nodes)
- 👥 **User Assigned Identity**: `myAKSCluster-agentpool` (For node pool identity)

---

## 🧪 `kubectl` Commands

- 🔐 Configure access to cluster:  
  ```bash
  az aks get-credentials --resource-group myResourceGroup --name myAKSCluster
  ```

- ℹ️ Check cluster info:  
  ```bash
  kubectl cluster-info
  ```

- 📦 Create a Pod:  
  ```bash
  kubectl run nginx --image=nginx
  ```

- ⚙️ Create a Deployment 

- 📡 Replica Set Creation 

---

## 📊 Monitoring & Log Analytics

### 📈 Log Analytics Workspace
- 🏢 **Workspace Name**: `cost-monitoring-workspace`
- 💾 **Data Retention**: 90 days (configurable)
- 💵 **Pricing Tier**: `PerGB2018` (pay-as-you-go)
- 📍 **Purpose**: Centralized logging and monitoring for all Azure resource

## 💰 Cost Alert Setup (Over $20)

### Step-by-Step:
1. 📊 **Create a Log Analytics Workspace**
2. 🛎️ **Create action group** via Azure Portal
3.  🛎️ **Create alert** via Azure Portal

### ✅ Test Alert via CLI:
```bash
az monitor metrics alert list --resource-group myResourceGroup --output table
```

---

---

## 🚀 Cloud Resource Access Request System (CRARS)

This project includes a full-stack web application for managing Azure resource access requests.

### 📁 Project Structure
```
├── backend/                 # Node.js Express API server
│   ├── app.js              # Main application file
│   ├── package.json        # Backend dependencies
│   └── Dockerfile          # Container configuration
├── access-request-frontend/ # React.js frontend application
│   ├── src/                # React components and logic
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
└── *.tf                    # Terraform infrastructure files
```

### 🔧 Application Setup

#### Backend (Node.js + Express)
- **Port**: 3000
- **Framework**: Express.js with CORS enabled
- **Dependencies**: express, cors
- **API Endpoints**:
  - `GET /health` - Health check endpoint
  - `POST /api/request` - Submit access requests

#### Frontend (React.js)
- **Port**: 3001 (default React dev server)
- **Framework**: React 19.1.0
- **Dependencies**: react, react-dom, axios
- **Features**: Access request form with validation

### 🏃‍♂️ Running the Application

#### Prerequisites
- Node.js (v18+)
- npm

#### Backend Setup
```bash
cd backend
npm install
npm start
```

#### Frontend Setup
```bash
cd access-request-frontend
npm install
npm start
```

### 🌐 API Documentation

#### Submit Access Request
**Endpoint**: `POST /api/request`

**Request Body**:
```json
{
  "email": "user@example.com",
  "subscription": "Production Subscription",
  "role": "Reader",
  "justification": "Need access to review resource configurations"
}
```

**Response**:
```json
{
  "message": "Access request submitted successfully!",
  "requestId": "REQ-1234567890",
  "status": "pending"
}
```

### 🔒 Security Features
- CORS configured for cross-origin requests
- Input validation on all API endpoints
- Request logging for audit trails
- Secure form handling with proper error management

### 🐳 Containerization
- Backend includes Dockerfile for container deployment
- Ready for Kubernetes deployment with provided YAML files
- Configured for Azure Container Registry integration

---

Let me know if you want to include images, Terraform code blocks, or flow diagrams!
