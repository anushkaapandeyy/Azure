#aks cluster config
resource "azurerm_kubernetes_cluster" "main"{
    name         = var.aks1_cluster_name
    location     = azurerm_resource_group.my_rg.location
    resource_group_name = azurerm_resource_group.my_rg.name
    dns_prefix = var.aks1_dns_prefix

    default_node_pool {
        name = "default"
        node_count = var.aks1_node_count
        vm_size = var.aks1_vm_size
        vnet_subnet_id = azurerm_subnet.my_subnet.id
    }
    identity {
        type = "SystemAssigned"
    }
    network_profile {
      network_plugin = "azure"
      service_cidr = "192.168.0.0/16"
      dns_service_ip = "192.168.0.10"
    }
    tags = var.common_tags
}

output "aks1_cluster_name" {
    value = azurerm_kubernetes_cluster.main.name
}

output "aks_cluster_fqdn" {
    value = azurerm_kubernetes_cluster.main.fqdn
}

output "kube_config" {
    value     = azurerm_kubernetes_cluster.main.kube_config_raw
    sensitive = true
}