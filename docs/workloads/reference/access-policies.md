---
tags: [workloads, reference]
---

# Access policies

Default hosts that are added and accessible for every workload:

| Host / service              | Port | Protocol  |
|-----------------------------|------|-----------|
| `kube-dns`                  | 53   | UDP / TCP |
| `metadata.google.internal`  | 80   | TCP       |
| `private.googleapis.com`    | 443  | TCP       |
| `login.microsoftonline.com` | 443  | TCP       |
| `graph.microsoft.com`       | 443  | TCP       |
| `aivencloud.com`            | 443  | TCP       |
| `unleash.nais.io`           | 443  | TCP       |
