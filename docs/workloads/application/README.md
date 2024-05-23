---
tags: [application, explanation, workloads, services]
---

# Application

A NAIS application lets you run one or more instances of a container image. 

An application is defined by its application manifest, which is a YAML file that describes how the application should be run and what resources it needs.

Once the application manifest is applied, NAIS will set up your application as specified. If you've requested resources, NAIS will provision and configure your application to use those resources.

## Related pages

[:bulb: Learn more about exposing your application](explanations/expose.md)

[:dart: Create an application](how-to/create.md)

[:dart: Expose an application](how-to/expose.md)

[:dart: Set up access policies for your application](../how-to/access-policies.md)

[:dart: Communicate with another application](../how-to/communication.md)

[:books: Complete application example](reference/application-example.md)

[:books: Application specification](reference/application-spec.md)
