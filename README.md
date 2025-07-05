# Azure
This repo is for hands on experience for creating resources on Azure

1. Deployment of RG myResourceGroup under free trial 
    1.a subscription ID - "75a79bec-3e88-4d48-99c4-d17a605f94c0"
2. Deployment of Vnet under myResourceGroup RG 
    2.a. name - myVirtualNetwork 
    2.b. address space - 10.0.0.0/16
3. Deployment of subnet under myVirtualNetwork
    3.a name - mySubnet
    3.b address space - 10.0.128.0/20
4. Deployed AKS cluster 
    4.a name - myAKSCluster
    4.b Identity - System assigned (authorize access from an AKS cluster to other Azure services for example - you can grant permissions to a managed identity to access secrets in an Azure key vault for use by the cluster.)
    4.c Automatically created infra resources - 
    4.c.1 Load balancer - kubernetes - outbound NAT for clusters
    4.c.2 Public IP address - e5289029-447c-4d11-88c8-635394b05a21 - outbound internet access for nodes, container image dowloads, API communication
    4.c.3 Network security group - aks-agentpool-14693408-nsg - security rules, node to node communication
    4.c.4 Virtual machine scale set - aks-default-22151992-vmss - worker nodes auto scalling capabilities
    4.c.5 user assigned identity - myAKSCluster-agentpool -Node pool identity (separate from cluster identity)
•  📋 Permissions for nodes to:
◦  Pull images from ACR
◦  Join the cluster
◦  Access Azure resources
◦  Communicate with load balance
    # In your aks.tf - this implicitly creates the default infra
    resource "azurerm_kubernetes_cluster" "main" {
    # ... your config
    # Azure automatically provisions supporting infrastructure
}

