# Configuration reloading

!!! info
    
    New feature; introduced August 30th 2021

The NAIS platform has the ability to restart your application if the underlying configuration in a `ConfigMap` or `Secret` resource changes.

This is an opt-in feature that is enabled by adding the following annotation to the `ConfigMap` or `Secret` resource.
Note that this works only for applications that are deployed using an `Application` resource.

``` yaml
kind: Secret  # or ConfigMap
metadata:
  annotations:
    reloader.stakater.com/match: "true"
```
