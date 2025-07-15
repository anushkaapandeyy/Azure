# Database for storing CRAS requests and user data
resource "azurerm_cosmosdb_account" "cras_cosmos" {
  name                = var.cosmos_name
  resource_group_name = azurerm_resource_group.my_rg.name
  location            = azurerm_resource_group.my_rg.location
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"
  
  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = azurerm_resource_group.my_rg.location
    failover_priority = 0
  }
  
  tags = var.common_tags
}

# SQL Database within Cosmos DB account
resource "azurerm_cosmosdb_sql_database" "cras_db" {
  name                = var.cosmos_db_database_name
  resource_group_name = azurerm_resource_group.my_rg.name
  account_name        = azurerm_cosmosdb_account.cras_cosmos.name
}

# Container(similar to table within sql db) for storing resource requests
resource "azurerm_cosmosdb_sql_container" "requests_container" {
  name                = var.cosmosdb_sql_container_name
  resource_group_name = azurerm_resource_group.my_rg.name
  account_name        = azurerm_cosmosdb_account.cras_cosmos.name
  database_name       = azurerm_cosmosdb_sql_database.cras_db.name
  partition_key_paths  = "/requestId" #distribute data across partitions
  
  indexing_policy {
    indexing_mode = "consistent"
    
    included_path {
      path = "/*"
    }
  }
}
