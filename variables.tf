#rg variables
variable "resource_group_name" {
    description = "name of RG"
    type = string
    default = "myResourceGroup"
}

#use azurerm_resource_group.my_rg.location for always picking my_rg's location
variable "location" {
    description = "azure region"
    type = string
    default = "East US"
}

variable "vnet1_name" {
    description = "name of vnet"
    type = string
    default = "myVirtualNetwork"
}

variable "state_rg_name" {
    description = "name of state storage account"
    type = string
    default = "terraform-state-rg"
}

variable "state_sa_name" {
    description = "name of state storage account"
    type = string
    default = "terraformstatesa"
}


variable "vnet1_address_space" {
    description = "Address space for the virtual network"
    type        = list(string)
    default     = ["10.0.0.0/16"]
}

variable "subnet1_name" {
  description = "Name of the subnet"
  type        = string
  default     = "mySubnet"
}

variable "subnet1_address_prefixes" {
  description = "Address prefixes for the subnet"
  type        = list(string)
  default     = ["10.0.128.0/20"]
}

# AKS Variables
variable "aks1_cluster_name" {
  description = "Name of the AKS cluster"
  type        = string
  default     = "myAKSCluster"
}

variable "aks1_dns_prefix" {
  description = "DNS prefix for the AKS cluster"
  type        = string
  default     = "myakscluster"
}

variable "aks1_node_count" {
  description = "Number of nodes in the default node pool"
  type        = number
  default     = 1
}

variable "aks1_vm_size" {
  description = "VM size for AKS nodes"
  type        = string
  default     = "standard_a2_v2"
  }

# Subscription ID
variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
  default     = "75a79bec-3e88-4d48-99c4-d17a605f94c0"
}

# Tags
variable "common_tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Environment = "Development"
    Project     = "CRAS"
    Owner       = "Anushka"
  }
}
# log analytics workspace

variable "log_analytics_workspace_name" {
  default = "cost-monitoring-workspace"
}

variable "alert_email_address" {
  default = "anushkaa.pandey1@gmail.com"
}

variable "cost_threshold" {
  default = 20
}

#nsg
variable "nsg_name" {
  description = "Name of the Network Security Group"
  type = string
  default = "myNetworkSecurityGroup"
}

# Databases for storing resource requests, user data, approval status
variable "cosmos_name" {
  description = "Name of the Cosmos DB account"
  type        = string
  default     = "cras-cosmos-db"
}

variable "cosmos_db_database_name" {
  description = "Name of the Cosmos DB database"
  type        = string
  default     = "cras-db"
}

variable "cosmosdb_sql_container_name" {
  description = "Name of the Cosmos DB SQL container"
  type        = string
  default     = "requests-container"
}

variable "acr_name" {
  description = "Name of the Azure Container Registry"
  type        = string
  default     = "crasacr"
}

# Key Vault Variables
variable "key_vault_name" {
  description = "Name of the Azure Key Vault"
  type        = string
  default     = "cras-keyvault"
}

variable "tenant_id" {
  description = "Azure AD Tenant ID"
  type        = string
  default     = "ac423623-0fce-4e1c-9912-67cca1db6b45"
}

variable "admin_object_id" {
  description = "Object ID of the admin user"
  type        = string
  default     = "8a77e406-2b4b-4e3b-907f-9dc9c57d64d6"
}
