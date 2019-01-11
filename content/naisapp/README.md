# A NAIS application

This document describes the different properties a application running on NAIS typically should have, or at least be conscious of why it's omitted.

## Handles termination gracefully

> TLDR; The application should make sure it listens to the `SIGTERM` signal, and prepare for shutdown (closing connections etc.) upon receival. 

When running on NAIS (or Kubernetes, actually) your application must be able to handle being shut down at any given time. This is because the platform might have to reboot the node your application is running on (e.g. because of a OS patch requiring restart), and in that case will reschedule your application on a different node.

To best be able to handle this in your application, it helps to be aware of the relevant parts termination lifecycle. 

1. Application (pod) gets status `TERMINATING`, and grace period starts (default 30s)
2. (simultaneous with 1) If the pod has a `preStop` hook defined, this is invoked
3. (simultaneous with 1) The pod is removed from the list of endpoints i.e. taken out of load balancing
4. (simultaneous with 1, but after `preStop` if defined) Container receives `SIGTERM`, and should prepare for shutdown
5. Grace period ends, and container receives `SIGKILL`
6. Pod disappears from the API, and is no longer visible for the client.

The platform will automatically add a `preStop`-hook that pauses the termination sufficiently that e.g. the ingress controller has time to update it's list of endpoints (thus avoid sending traffic to a application while terminating).

## [Exposes relevant application metrics](../metrics)
