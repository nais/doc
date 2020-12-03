# K8s overview

A simplified overview over resources created/mounted/used by a nais-app.

![Overview of kubernetes resources created when deploy your nais-app](nais.png)

## Generate new image

We're using [the Dot language](https://graphviz.org/doc/info/lang.html) to create the overview.

Run the following command in this directory:
```bash
dot -Tpng nais.dot -o nais.png
```
