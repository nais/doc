---
tags: [command-line, reference]
---

# kubeconfig command

Create a kubeconfig file for connecting to available clusters for you.
This requires that you have the gcloud command line tool installed, configured and logged in.
You can log in with `gcloud auth login --update-adc`.

```bash
nais kubeconfig
```

| Flag      | Short | Description                                                             |
| --------- | ----- | ----------------------------------------------------------------------- |
| overwrite | -o    | Overwrite config already in the kubeconfig-file                         |
| clear     | -c    | Delete config before retrieving new one                                 |
| exclude   | -e    | Exclude clusters from the config, comma separated list of cluster names |
| verbose   | -v    | More output, mostly useful combined with overwrite                      |

!!! info "hello"
    You don't have to use the environment variable `KUBECONFIG`, instead you can use the default kubectl-folder `~/.kube`.
    Delete the old `navikt/kubeconfig`-repo and remove the environment file, and then run `nais kubeconfig`.
