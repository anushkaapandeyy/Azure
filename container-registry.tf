#Azure container Registry
resource "azurerm_container_registry" "cras_acr" {
    name = var.acr_name 
  resource_group_name = azurerm_resource_group.my_rg.name
  location = azurerm_resource_group.my_rg.location
  sku = "Standard"
  admin_enabled       = false
  # Enable managed identity for integration with AKS
  identity {
    type = "SystemAssigned"
  }

  tags = var.common_tags
}

#rbac for aks to pull images from ACR
resource "azurerm_role_assignment" "aks_acr_pull" {
    principal_id         = azurerm_kubernetes_cluster.main.kubelet_identity[0].object_id
  role_definition_name = "AcrPull"
  scope                = azurerm_container_registry.cras_acr.id
  
}