---
tags: [workloads, how-to, gcp, fss, on-premises, networking, timeout]
conditional: [tenant, nav]
---

# Communicate reliably between GCP and on-prem

This guide shows you how to configure HTTP clients to handle firewall timeouts when calling on-premises services from GCP.

## Prerequisites

- Application running in GCP
- Calling services in on-prem FSS environment via `*.fss-pub.nais.io` ingress
- Access to modify HTTP client configuration

## Background

The on-prem firewall drops idle connections after 60 minutes without sending TCP close signals. HTTP clients reusing these dead connections will fail with timeout or connection reset errors.

## Steps

### 1. Configure HTTP client connection time-to-live

Set connection TTL to 55 minutes (below the 60-minute firewall timeout):

=== "Apache HttpClient"

    ```java
    PoolingHttpClientConnectionManager cm = new PoolingHttpClientConnectionManager();
    cm.setMaxTotal(200);
    cm.setDefaultMaxPerRoute(20);
    cm.setConnectionTimeToLive(55, TimeUnit.MINUTES);

    CloseableHttpClient client = HttpClients.custom()
        .setConnectionManager(cm)
        .evictIdleConnections(55, TimeUnit.MINUTES)
        .build();
    ```

=== "OkHttp"

    ```java
    OkHttpClient client = new OkHttpClient.Builder()
        .connectionPool(new ConnectionPool(10, 55, TimeUnit.MINUTES))
        .build();
    ```

=== "Spring WebClient"

    ```java
    ConnectionProvider provider = ConnectionProvider.builder("onprem-pool")
        .maxConnections(200)
        .maxIdleTime(Duration.ofMinutes(55))
        .maxLifeTime(Duration.ofMinutes(59))
        .evictInBackground(Duration.ofMinutes(5))
        .build();

    HttpClient httpClient = HttpClient.create(provider)
        .option(ChannelOption.SO_KEEPALIVE, true)
        .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 5000)
        .responseTimeout(Duration.ofSeconds(10));

    WebClient client = WebClient.builder()
        .clientConnector(new ReactorClientHttpConnector(httpClient))
        .build();
    ```

=== "Ktor CIO"

    ```kotlin
    HttpClient(CIO) {
        engine {
            maxConnectionsCount = 200
            endpoint {
                keepAliveTime = 55_000
                connectTimeout = 5_000
                requestTimeout = 10_000
            }
        }
    }
    ```

=== "Node.js (http/https)"

    ```javascript
    const https = require('https');

    const agent = new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 55 * 60 * 1000,
        maxSockets: 200,
        maxFreeSockets: 20,
        timeout: 55 * 60 * 1000
    });

    // Use with fetch or http.request
    fetch('https://onprem-service.fss-pub.nais.io', { agent });
    ```

=== "Axios"

    ```javascript
    const axios = require('axios');
    const https = require('https');

    const httpsAgent = new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 55 * 60 * 1000,
        maxSockets: 200,
        maxFreeSockets: 20,
        timeout: 55 * 60 * 1000
    });

    const client = axios.create({
        httpsAgent: httpsAgent,
        timeout: 10000
    });
    ```

=== "Node-fetch"

    ```javascript
    const fetch = require('node-fetch');
    const https = require('https');

    const agent = new https.Agent({
        keepAlive: true,
        keepAliveMsecs: 55 * 60 * 1000,
        maxSockets: 200,
        maxFreeSockets: 20,
        timeout: 55 * 60 * 1000
    });

    fetch('https://onprem-service.fss-pub.nais.io', { agent })
        .then(res => res.json());
    ```

### 2. Enable TCP keep-alive

Enable SO_KEEPALIVE to send periodic packets on idle connections (shown in Spring WebClient example above).

### 3. Configure background eviction

Set background eviction to proactively remove stale connections every 5 minutes (shown in Spring WebClient example above).

### 4. Monitor metrics and logs

Use [OpenTelemetry auto-instrumentation](../../observability/how-to/auto-instrumentation.md) to track error rates and latency:

=== "Java"

    ```promql
    # Error rate for outbound requests to FSS
    sum(rate(http_client_request_duration_seconds_count{
      server_address=~".*fss-pub.nais.io",
      http_response_status_code!="200"
    }[5m]))

    # Request latency to FSS services
    histogram_quantile(0.99,
      sum(rate(http_client_request_duration_seconds_bucket{
        server_address=~".*fss-pub.nais.io"
      }[5m])) by (le)
    )
    ```

=== "Node.js"

    ```promql
    # Error rate for outbound requests to FSS
    sum(rate(http_client_duration_milliseconds_count{
      server_address=~".*fss-pub.nais.io",
      http_response_status_code!="200"
    }[5m]))

    # Request latency to FSS services
    histogram_quantile(0.99,
      sum(rate(http_client_duration_milliseconds_bucket{
        server_address=~".*fss-pub.nais.io"
      }[5m])) by (le)
    )
    ```

Monitor application logs for these errors (should decrease after configuration):

- `java.net.SocketTimeoutException: Connection timed out`
- `java.net.SocketException: Connection reset by peer`
- `Connection closed prematurely BEFORE response`

## Related resources

- [HTTP client connection management](../explanations/http-client-connection-management.md) - Understanding connection pooling and timeouts
- [Access policies](access-policies.md) - Configure outbound access to FSS services
- [Migrating to GCP FAQ](../explanations/migrating-to-gcp.md#how-do-i-reach-an-application-found-on-premises-from-my-application-in-gcp) - Overview of GCP-FSS communication
- [OpenTelemetry metrics](../../observability/metrics/reference/otel.md#http-client-metrics) - Available HTTP client metrics
