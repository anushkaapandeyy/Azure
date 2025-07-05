provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

resource "azurerm_resource_group" "my_rg" {
  name     = var.resource_group_name
  location = "East US"
}

output "resource_group_name" {
  value = azurerm_resource_group.my_rg
}

resource "azurerm_virtual_network" "my_vnet" {
  name                = var.vnet1_name
  location            = azurerm_resource_group.my_rg.location
  resource_group_name = azurerm_resource_group.my_rg.name
  address_space       = var.vnet1_address_space
  tags                = var.common_tags
}

resource "azurerm_subnet" "my_subnet" {
  name                 = var.subnet1_name
  resource_group_name  = azurerm_resource_group.my_rg.name
  virtual_network_name = azurerm_virtual_network.my_vnet.name
  address_prefixes     = var.subnet1_address_prefixes
}
