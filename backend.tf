terraform {
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "storageaccounttfaap"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}
