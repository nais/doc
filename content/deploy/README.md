# Deployment

The easiest way to get your application running on NAIS is to create a [Application-resource/nais.yaml](https://github.com/nais/naiserator/blob/master/examples/app.yaml).

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
