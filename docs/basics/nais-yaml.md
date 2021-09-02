# nais.yaml

At the core of NAIS lies Kubernetes, which is a Swiss army knife of tools, and each of these tools comes with its own set of instructions in the form of YAML.
We don't want our developers to have to deal with all this yaml, so we've condensed the essential parts in to a single yaml file that we use to generate all the underlying Kubernetes resources.

![Overview of Kubernetes resources created upon deployment of your nais-app](/assets/nais-yaml.png)

nais.yaml is what you use to tell the platform all your application's needs and desires.
