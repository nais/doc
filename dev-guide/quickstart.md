Quick start
===========

### Install the necessary tools

1. Install [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
   * Can also recommend [Kubectx](https://nais.io/doc/#/overview) for cluster and namespace switching
2. Configure Kubectl for our clusters, using [kubeconfigs](https://github.com/navikt/kubeconfigs)
3. Install [Docker](https://nais.io/doc/#/overview) for local testing and development


###  Migrate your apps

If your app is not already running on NAIS, you need to migrate it.


#### Outline of migration or deploy of new app to NAIS

1. Make sure your application behave according to the NAIS [contracts](/#contracts)
2. Create a [Docker image](https://docs.docker.com/engine/reference/builder/) containing your application
3. Push your image to the [NAIS docker-registry](/dev-guide/nexus#docker-registry)
4. Create you [NAIS manifest](/contracts/manifest) (nais.yaml) based on the [example nais.yaml](https://github.com/nais/naisd/blob/master/nais_example.yaml)
5. Push your manifest to the [NAIS maven-repo](/dev-guide/nexus#maven-repo)
6. [Deploy](/dev-guide/naisd#deplo) your application to the [clusters](/#clusters) of your chosing


## If you have any questions:

1. Read the documentation
2. [Contact us](/#contact-us)
