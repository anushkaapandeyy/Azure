resource "azurerm_log_analytics_workspace" "cost_monitoring" {
    name = var.log_analytics_workspace_name
    location = azurerm_resource_group.my_rg.location
    resource_group_name = azurerm_resource_group.my_rg.name
    sku = "PerGB2018"
    retention_in_days = "30"
    tags = var.common_tags
}