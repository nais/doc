# K8s overview

A simplified overview of resources created, mounted, and used by a nais-app.

![Overview of Kubernetes resources created upon deployment of your nais-app](nais.png)

## Generate new image

Using [the DOT language](https://graphviz.org/doc/info/lang.html), one can create an overview of an application.

Run the following command in this directory:
```bash
dot -Tsvg nais.dot -o nais.svg
```
