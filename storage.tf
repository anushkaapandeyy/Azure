resource "azurerm_resource_group" "terraform-state"{
    name = var.state_rg_name
    location = "East US"
}

resource "azurerm_storage_account" "terraform-state" {
  name = var.state_sa_name
  resource_group_name = azurerm_resource_group.terraform-state
  location = azurerm_resource_group.terraform-state.location
  account_tier = "Standard"
  account_replication_type = "LRS"
}
#container
resource "azurerm_storage_container" "terraform-state" {
  name                  = "tfstate"
  storage_account_name  = azurerm_storage_account.terraform_state.name
  container_access_type = "private"
}