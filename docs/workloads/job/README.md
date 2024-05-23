---
tags: [job, explanation, workloads, services]
---

# NAIS job

A NAIS job is used for tasks meant to complete and then exit. This can either run as a one-off task or on a schedule, like a [cron job](https://en.wikipedia.org/wiki/Cron).

A job is defined by its job manifest, which is a YAML file that describes how the job should be run and what resources it needs.

Once the job manifest is applied, NAIS will set up your job as specified. If you've requested resources, NAIS will provision and configure your job to use those resources.

## Related pages

[:dart: Create a job](how-to/create.md)

[:dart: Set up access policies for your workload](../how-to/access-policies.md)

[:dart: Communicate with another workload](../how-to/communication.md)

[:books: Complete job example](reference/naisjob-example.md)

[:books: Job specification](reference/naisjob-spec.md)
