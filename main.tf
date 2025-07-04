provider "azurerm" {
  features {}
  subscription_id = "75a79bec-3e88-4d48-99c4-d17a605f94c0"
}

resource "azurerm_resource_group" "my_rg" {
  name     = "myResourceGroup"
  location = "East US"
}

output "resource_group_name" {
  value = azurerm_resource_group.my_rg
}

resource "azurerm_virtual_network" "my_vnet" {
  name                = "myVirtualNetwork"
  location            = azurerm_resource_group.my_rg.location
  resource_group_name = azurerm_resource_group.my_rg.name
  address_space       = ["10.0.0.0/16"]
}

resource "azurerm_subnet" "my_subnet" {
  name                 = "mySubnet"
  resource_group_name  = azurerm_resource_group.my_rg.name
  virtual_network_name = azurerm_virtual_network.my_vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}
