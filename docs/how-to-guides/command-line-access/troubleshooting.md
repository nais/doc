## Troubleshooting

## Mac: GCP auth plugin has been removed
If you get `error: The gcp auth plugin has been removed` after you have updated the kubeconfig, you might be missing kubelogin.

Run ```which kubelogin``` in a terminal

Install kubelogin if the output is empty, (Follow the instructions in [kubelogins documentation](https://azure.github.io/kubelogin/install.html))