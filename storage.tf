resource "azurerm_resource_group" "terraform_state" {
    name = "terraform-state-rg"
    location = "East US"
}

resource "azurerm_storage_account" "terraform_state" {
  name = "storageaccounttfstate"
  resource_group_name = azurerm_resource_group.terraform_state.name
  location = azurerm_resource_group.terraform_state.location
  account_tier = "Standard"
  account_replication_type = "LRS"
}

# Container for storing Terraform state
resource "azurerm_storage_container" "terraform_state" {
  name                  = "tfstate"
  storage_account_name  = azurerm_storage_account.terraform_state.name
  container_access_type = "private"
}
