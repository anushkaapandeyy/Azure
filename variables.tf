#rg variables
variable "resource_group_name" {
    description = "name of RG"
    type = string
    default = "mgResourceGroup"
}
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
  default     = ["10.0.1.0/24"]
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
  default     = "Standard_D2_v2"
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
    Project     = "AKS-Learning"
    Owner       = "Anushka"
  }
}