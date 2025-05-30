---
tags: [workloads, reference, webproxy]
conditional: [tenant, nav]
---

# Webproxy

In Navs on-premises environments, workloads that need to make external HTTP(S) requests must set `webproxy` to `true` in their [application spec](../../workloads/application/reference/application-spec.md#webproxy).

When `webproxy` is enabled, the platform provides a set of environment variables to configure the proxy settings for your workload.

## Linux 
Most Linux applications should auto-detect these settings from the `$HTTP_PROXY`, `$HTTPS_PROXY` and `$NO_PROXY` environment variables (and their lowercase counterparts).

## Java

Java applications can start the JVM using parameters from the `$JAVA_PROXY_OPTIONS` environment variable.
To do this, you either need a launcher script that copies the value from `JAVA_PROXY_OPTIONS` to `JDK_JAVA_OPTIONS`, 
or you can set the `JDK_JAVA_OPTIONS` environment variable directly in your [application spec](../application/reference/application-spec.md#env).:

```
env:
- name: JDK_JAVA_OPTIONS
  value: $(JAVA_PROXY_OPTIONS)
```

This takes advantage of [Kubernetes Dependent Environment Variables](https://kubernetes.io/docs/tasks/inject-data-application/define-interdependent-environment-variables/), which allows you to use the value of one environment variable in another.

Since environment variables set by the platform are defined before the application variables, you can refer to the `JAVA_PROXY_OPTIONS` variable when setting `JDK_JAVA_OPTIONS`.
