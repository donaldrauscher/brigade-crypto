### Building a K8s Cluster with Brigade

Build the K8s cluster:
```
source build_cluster.sh
```

This does the following:
* Creates cluster with Terraform (GCP)
* Installs Helm (with RBAC)
* Installs Brigade server (with RBAC)

Destroy the K8s cluster:
```
source destroy_cluster.sh
```

Build Brigade client (`brig`):
```
source build_brig_client.sh ~/.local/bin
```

This builds the Brig client inside a Docker container with Go and then copies to a directory of your choosing.
