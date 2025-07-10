terraform {
    backend "azurerm"{
        resource_group_name = "terrform-state-rg"
        storage_account_name = "storage-account-tf-state"
        container_name = "tfstate"
        key = "terraform.tfstate"
        }
 }