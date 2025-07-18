# Azure Key Vault Configuration
resource "azurerm_key_vault" "cras_kv" {
  name                = var.key_vault_name
  location            = azurerm_resource_group.my_rg.location
  resource_group_name = azurerm_resource_group.my_rg.name
  tenant_id           = var.tenant_id
  sku_name            = "standard"

  # Access policy for admin
  access_policy {
    tenant_id = var.tenant_id
    object_id = var.admin_object_id

    secret_permissions = ["Get", "List", "Set", "Delete"]
  }

  tags = var.common_tags
}

# Cosmos DB Connection Secret
resource "azurerm_key_vault_secret" "cosmos_connection_string" {
  name         = "cosmos-db-connection-string"
  value        = azurerm_cosmosdb_account.cras_cosmos.primary_sql_connection_string
  key_vault_id = azurerm_key_vault.cras_kv.id
}

