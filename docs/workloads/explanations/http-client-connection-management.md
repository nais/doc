---
tags: [explanation, http, connections, timeouts, networking]
---

# HTTP client connection management

HTTP clients reuse connections from a pool to avoid repeating the TCP and TLS handshake on every request. This is almost always what you want, but connection reuse assumes a pooled connection is still alive. On the Nais platform, a few characteristics of the surrounding infrastructure break that assumption in ways that are easy to miss. This page explains those interactions so you can configure your client to match.

## Idle connections get dropped silently

Stateful firewalls, load balancers, and NAT gateways all keep a table of active connections and evict entries that have been idle for too long. The problem is that most of them drop the connection **silently** — no TCP `FIN` or `RST` is sent to either side. The connection still looks healthy in your pool, so your client happily reuses it and the request fails with a `Connection reset` or `Unexpected end of stream` error, typically after a period of low traffic.

The fix has two parts:

- Set a **connection TTL** (maximum lifetime) shorter than the shortest idle timeout on the path, so the client retires connections before the infrastructure does.
- Enable **background eviction** so stale connections are pruned proactively instead of on the next request. Without it, the first request after an idle period fails and only the retry succeeds.

Setting a very short request timeout does *not* solve this — request timeout detects hung requests, it does not refresh pooled connections. Keep the two concerns separate.

{% if tenant() == "nav" %}
!!! note "On-prem firewall (fss-pub ingresses)"

    The on-prem firewall in front of `*.fss-pub.nais.io` ingresses drops idle connections after **60 minutes** without sending TCP close signals. Applications in GCP calling on-prem FSS services must set their connection TTL below this (55 minutes is a safe value) and enable background eviction. See [Communicate reliably between GCP and on-prem](../how-to/gcp-fss-communication.md) for concrete client configuration.
{% endif %}

## DNS caching and pod rotation

Services on Nais have a short DNS TTL of **30 seconds**, because the IPs behind a service change whenever pods are rescheduled, scaled, or redeployed. Your client is expected to re-resolve frequently and follow the new IPs.

Two things get in the way:

- **The JVM caches DNS indefinitely by default.** With the default `networkaddress.cache.ttl`, a JVM resolves a hostname once and never looks again, so it keeps dialing IPs that no longer exist. Set `networkaddress.cache.ttl` to a small value (for example 30 seconds) to respect the platform TTL.
- **Pooled connections pin the IP they were opened to.** Even with a correct DNS TTL, a long-lived pooled connection stays bound to the IP it dialed originally. After the pod behind that IP is gone, the connection is dead. A bounded connection TTL forces periodic re-resolution and lets the pool pick up new pods.

## Pod lifecycle affects the services that call you

When your pods are terminated — during deploys, scaling, or node maintenance — shutdown is not instantaneous, and it is not perfectly coordinated with clients that hold connections to you:

1. The pod receives `SIGTERM` and enters the `Terminating` state.
2. Its endpoint is removed from the Service, but this propagates with **eventual consistency** — for a short window, callers may still route to the terminating pod.
3. A grace period (default **30 seconds**) lets in-flight requests finish before the process is killed.

Because of the propagation window, other services can hold pooled connections to a pod that is already shutting down, and requests over those connections may fail. Both sides share responsibility for handling this cleanly:

- **As a client**, retry idempotent requests with exponential backoff so a single dropped connection does not surface as an error.
- **As a server**, shut down gracefully: stop accepting new work on `SIGTERM`, keep serving in-flight requests through the grace period, and use a [`preStop` hook](./good-practices.md) plus readiness probes so traffic is drained before the process exits.

## Timeout types at a glance

Different timeouts control different things. Configuring them correctly — and not confusing them — is what makes a client resilient on Nais.

| Timeout | What it controls |
| --- | --- |
| Connection timeout | How long to wait for the initial TCP connection to establish. |
| Read / response timeout | How long to wait for the response after the request is sent. |
| Connection TTL / idle timeout | How long a pooled connection may live or stay idle before it is retired — keep this below the infrastructure idle timeout. |
| Background eviction | How often the pool is swept for stale connections in the background. |

## Related resources

{% if tenant() == "nav" %}
- [Communicate reliably between GCP and on-prem](../how-to/gcp-fss-communication.md) - Practical configuration for on-premises firewall timeouts
{% endif %}
- [Access policies](../how-to/access-policies.md) - Configure network access between services
- [Good practices](good-practices.md) - Application development best practices
