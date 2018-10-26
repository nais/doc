App migration
=============

If your app is not already running on NAIS, you need to migrate it.


## Outline of migration or deploy of new app to NAIS

1. Make sure your application behave according to the NAIS [contracts](/documentation/contracts)
2. Create a [Docker image](https://docs.docker.com/engine/reference/builder/) containing your application
3. Push your image to the [NAIS docker-registry](/documentation/dev-guide/nexus.md#docker-registry)
4. Create your [NAIS manifest](/documentation/contracts) (nais.yaml) based on the [example nais.yaml](https://github.com/nais/naisd/blob/master/nais_example.yaml)
5. Push your manifest to the [NAIS maven-repo](/documentation/dev-guide/nexus.md#maven-repo)
6. [Deploy](/documentation/dev-guide/naisd.md#deploy) your application to the [clusters](/documentation/README.md#clusters) of your chosing
