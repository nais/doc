# Application

!!! warning
    This explanation is incomplete

A [NAIS application](../../reference/application-example.md) lets you run one or more instances of a container image. 

An application is defined by its [application manifest](../../reference/application-spec.md), which is a YAML file that describes how the application should be run and what resources it needs.

Once the application manifest is applied, NAIS will set up your application as specified. If you've requested resources, NAIS will provision and configure your application to use those resources.

