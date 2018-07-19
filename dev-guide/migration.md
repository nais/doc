App migration
=============

If your app is not already running on NAIS, you need to migrate it.


## Outline of migration or deploy of new app to NAIS

1. Make sure your application behave according to the NAIS [contracts](/#contracts)
2. Create a [Docker image](https://docs.docker.com/engine/reference/builder/) containing your application
3. Push your image to the [NAIS docker-registry](/dev-guide/nexus#docker-registry)
4. Create you [NAIS manifest](/contracts) (nais.yaml) based on the [example nais.yaml](https://github.com/nais/naisd/blob/master/nais_example.yaml)
5. Push your manifest to the [NAIS maven-repo](/dev-guide/nexus#maven-repo)
6. [Deploy](/dev-guide/naisd.md#deploy) your application to the [clusters](/#clusters) of your chosing
