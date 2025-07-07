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

resource "azurerm_network_security_group" "my_nsg" {
  name                 = var.nsg_name
  location             = azurerm_resource_group.my_rg.location
  resource_group_name  = azurerm_resource_group.my_rg.name
  tags                 = var.common_tags 
  security_rule {
    name                       = "AllowHTTP"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80" //standard http protocol
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
  security_rule {
  name                       = "AllowHTTPS"
  priority                   = 1002
  direction                  = "Inbound"
  access                     = "Allow"
  protocol                   = "Tcp"
  source_port_range          = "*"
  destination_port_range     = "443" //standard https protocol port
  source_address_prefix      = "*"
  destination_address_prefix = "*"
  }
  security_rule {
  name                       = "AllowSSH" //allow administrators to remotely connect to linux server When you need to run commands on your server, deploy code, or troublesho
  priority                   = 1003
  direction                  = "Inbound"
  access                     = "Allow"
  protocol                   = "Tcp"
  source_port_range          = "*"
  destination_port_range     = "22" //secure shell protocol default port
  source_address_prefix      = "*"
  destination_address_prefix = "*"
}
}
resource "azurerm_subnet_network_security_group_association" "my_nsg_association" {
  subnet_id                 = azurerm_subnet.my_subnet.id
  network_security_group_id = azurerm_network_security_group.my_nsg.id
} 
