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

### 4️⃣ Azure Kubernetes Service (AKS) Cluster
- ☸️ **Cluster Name**: `myAKSCluster`  
- 🆔 **Identity Type**: System Assigned (used to access other Azure resources like Key Vaults)  

#### ⛓️ Automatically Created Infrastructure:
- 🌀 **Load Balancer**: `kubernetes` (Handles outbound NAT for cluster)
- 🌍 **Public IP**: `e5289029-447c-4d11-88c8-635394b05a21` (Allows image downloads & API communication)
- 🔐 **NSG**: `aks-agentpool-14693408-nsg` (Controls traffic rules and node communication)
- 🖥️ **VM Scale Set**: `aks-default-22151992-vmss` (Provides autoscaling for worker nodes)
- 👥 **User Assigned Identity**: `myAKSCluster-agentpool` (For node pool identity)

#### ✅ Permissions for Nodes:
- 📥 Pull images from Azure Container Registry (ACR)  
- 🔗 Join the AKS Cluster  
- 🔐 Access other Azure Resources  
- 🔁 Communicate with Load Balancer

```hcl
# aks.tf snippet
resource "azurerm_kubernetes_cluster" "main" {
  # Your AKS config here
  # Azure will automatically provision supporting infra
}
```

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

- ⚙️ Create a Deployment *(You can add your specific command)*

- 📡 Replica Set Creation *(You can add your specific command)*

---

## 💰 Cost Alert Setup (Over $20)

### Step-by-Step:
1. 📊 **Create a Log Analytics Workspace**
2. 🛎️ **Set Cost Alert** via Azure Portal

### ✅ Test Alert via CLI:
```bash
az monitor metrics alert list --resource-group myResourceGroup --output table
```

---

Let me know if you want to include images, Terraform code blocks, or flow diagrams!
