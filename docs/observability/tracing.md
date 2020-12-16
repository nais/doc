# Tracing

With program flow distributed across many microservices, the ability to observe the different services in context can become a valuable tool for development and operations. For the GCP clusters, NAIS offers a rich toolkit for this.

The simplest way to get an overview is to observe the Istio service mesh using Kiali. If there is a need to observe the causal relationship among individual calls to services, [envoy-based tracing](tracing.md#envoy-based-context-extraction) is required.

## Visualizing service mesh with Kiali

Kiali can be reached at kiali._cluster-name_.nais.io, eg. [kiali.dev-gcp.nais.io](https://kiali.dev-gcp.nais.io).

![Kiali service mesh showing the relationship between sosialhjelp-modia, modia-api, and mock-alt-api](../assets/kiali-sample.gif)

NAIS leverages the Istio service mesh and Kiali dashboard to give developers a visualization of the service mesh and its general health. Kiali will also give a quick graphical overview of failing HTTP calls.

![Example of a service returning 400 errors](../assets/kiali-400-sample.gif)

## Envoy-based context extraction

Kiali offers a nice view of statistics. However, it is not possible to say that request A is a consequence of request B without adding additional context. Istio supports transparently reading special tracing headers from HTTP requests, and submitting trace data to a tracing system.

The tracing system chosen by NAIS is [Jaeger](https://www.jaegertracing.io/) \(which supports the [Zipkin](https://zipkin.io/) API, used by Istio\).

![Illustration of envoy-based tracing](../assets/envoy-tracing.png)

This allows you to get up and running quickly with distributed tracing with relatively minimal changes needed to your code. All you need to do is copy the [appropriate headers](tracing.md#propagating-trace-headers) from incoming requests to any outgoing it may cause, and istio-proxy and Jaeger does the rest for you.

Loading a React page which issues hundreds of API calls generates a trace like this:

![Example trace of a sosialhjelp-modia page load](../assets/example-trace.png)

If envoy-based tracing covers your needs, this is the recommended approach to tracing.

There are some limitations to envoy-based tracing: If you need to attach debug context to spans, or create spans even inside a single node process, see [Direct submission](tracing.md#direct-submission).

### Configuring NAIS

To enable envoy-based tracing, add the following stanza to nais.yaml under "spec":

```text
apiVersion: "nais.io/v1alpha1"
kind: "Application"
spec:
  ...
  tracing:
    enabled: true
```

When this is enabled, the following changes occur to your deployment:

* A network policy is enabled which allows egress to the Jaeger app services
* The istio-proxy sidecar is configured to sample 100% of incoming requests

This will have the effect that any incoming requests to your application will generate a trace to Jaeger. These traces can be viewed in tracing._cluster-name_.nais.io, eg [tracing.dev-gcp.nais.io](https://tracing.dev-gcp.nais.io/).

### Propagating trace headers

To give Jaeger sufficient context to reconstruct a trace, the application must read a set of HTTP headers from the incoming request and forward them to any requests further down the chain.

The following trace headers must be forwarded as they are received:

* `x-b3-traceid`
* `x-b3-spanid`
* `x-b3-parentspanid`
* `x-b3-sampled`
* `x-b3-flags`
* `x-b3`

The `traceid` identifies a single trace. `spanid` identifies a span. For all spans below top-level, `parentspanid` identifies the span's parent.

![Illustration of the relationship between trace, span and parentspan IDs](../assets/trace-span-ids.png)

_See also_ [_Istio's documentation_](https://istio.io/latest/faq/distributed-tracing/#how-to-support-tracing) _for more detailed definitions of the headers_

### Code examples

Tracing was initially deployed in NAIS in collaboration with team digisos, who used envoy-based tracing to identify an intermittent problem causing spikes in page render time. The examples below are therefore examples, not references. Readers who find more elegant solutions are encouraged to submit pull requests to this documentation.

#### React

The following code generates a 128-byte UUID, which is split into two 64-bit identifiers. These identifiers are then passed along with API requests. This creates a trace which spans an entire page session.

```text
// In the file top level
import { v4 as uuidv4 } from 'uuid';
const sessionTraceID = uuidv4().toString().replaceAll('-','');

        // Inside the request method
        headers.append('X-B3-TraceId', sessionTraceID.substr(0, 16));
        headers.append('X-B3-SpanId', sessionTraceID.substr(16, 16));
```

## Direct submission

The user may send tracing data to jaeger via [a plethora of supported protocols](https://www.jaegertracing.io/docs/1.20/apis/), including OpenTracing, Thrift and Zipkin. A [robust ecosystem of libraries](https://www.jaegertracing.io/docs/1.20/client-libraries/) exists for several languages.

This mode of using Jaeger is not currently supported by NAIS, but if there is a need, it would be easy to implement. This is largely mentioned here to see if there is any demand. If there is, please ping Tore Sinding Bekkedal or \#nais.

