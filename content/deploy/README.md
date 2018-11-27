# Deployment

### Prerequisites 

- [Access to the cluster](../security/operational_access.md)
- Docker image pushed to repository

The easiest way to get your application running on NAIS is to create a [Application-resource/nais.yaml](https://github.com/nais/naiserator/blob/master/examples/app.yaml).

This is a [custom resource](https://kubernetes.io/docs/tasks/access-kubernetes-api/custom-resources/custom-resource-definitions/) defined by the platform team, and contains the necessary information for setting up your application on NAIS. Read more about the technical details [here](https://github.com/nais/naiserator)
 


`kubectl apply -f nais.yaml`

Verify that your application is running properly

`kubectl describe app <app name>`

## Environment variables

## Secrets

## Files


## Migrating from naisd

[link](migrating_from_naisd.md)

## Still using naisd

See doc [here](naisd.md)


TODO: find a simpler example of app.yaml
