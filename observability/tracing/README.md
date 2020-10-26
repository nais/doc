# Distributed tracing

With program flow distributed across many microservices, the ability to observe the different services in context can become a valuable tool for development and operations. 
The simplest way to accomplish this is to observe the Istio service mesh using Kiali.

Additionally, NAIS supports two different methods of distributed tracing: Either by [direct submission of tracing data to Jaeger](#trace-headers), or [envoy-based tracing](#envoy-based-extraction).

## Visualizing service mesh with Kiali

With no code changes necessary, NAIS leverages Istio and the Kiali dashboard to give developers a visualization of the service mesh and its general health.
Kiali can be reached at kiali.*cluster-name*.nais.io, eg. [kiali.dev-gcp.nais.io](kiali.dev-gcp.nais.io).

![Kiali service mesh showing the relationship between sosialhjelp-modia, modia-api, and mock-alt-api](kiali-sample.gif)

In addition to visualizing traffic levels, it will also identify failing HTTP calls.

![Example of a service returning 400 errors](kiali-400-sample.gif)

## Envoy-based context extraction

![Illustration of envoy-based tracing](envoy-tracing.png)

Unless your projects have needs which can only be met by direct submission of tracing data (eg. the need to add additional context), this is the recommended approach to tracing.

NAIS can be configured to have the istio-proxy sidecar transparently submit tracing data to jaeger, by extracting context data from headers attached to HTTP calls.

The advantage to this approach is that it allows you to get up and running quickly with distributed tracing with relatively minimal changes needed to your code base. It also has limitations; to attach context or to create spans even inside a single node process, see [Direct submission](#direct-submission).

### NAIS configuration

To enable envoy-based tracing, add the following stanza to nais.yaml under "spec":

```
apiVersion: "nais.io/v1alpha1"
kind: "Application"
spec:
  ...
  tracing:
    enabled: true
```

### Trace headers

To give Jaeger sufficient context to reconstruct a trace, the application must read a set of HTTP headers from the incoming request and forward them to any requests further down the chain.

*See also [Istio's documentation](https://istio.io/latest/faq/distributed-tracing/#how-to-support-tracing)*

The following trace headers must be forwarded as they are received:

* `x-b3-traceid`
* `x-b3-spanid`
* `x-b3-parentspanid`
* `x-b3-sampled`
* `x-b3-flags`
* `x-b3`

**TODO: Check source code to find which headers are actually dealt with by istio-proxy**

**TODO: Figure out semantics of the sampled/flags headers** 

### Code examples

Tracing was initially deployed in NAIS in collaboration with team digisos, who used envoy-based tracing to find the source of slow page loads.

#### React

The following code generates a 128-byte UUID, which is split into two 64-bit identifiers.

**TODO: Clarify jaeger's requirements for identifier; documentation is unclear/contradictory**

```
// In the file top level
import { v4 as uuidv4 } from 'uuid';
const sessionTraceID = uuidv4().toString().replaceAll('-','');

        // Inside the request method
        headers.append('X-B3-TraceId', sessionTraceID.substr(0, 16));
        headers.append('X-B3-SpanId', sessionTraceID.substr(16, 16));
```

## Direct submission

The user may send tracing data to jaeger via [a plethora of supported protocols](https://www.jaegertracing.io/docs/1.20/apis/), including OpenTracing, Thrift and Zipkin.
A [robust ecosystem of libraries](https://www.jaegertracing.io/docs/1.20/client-libraries/) exist for several languages.

This mode of using Jaeger is not currently supported by NAIS, but should be easy to implement. This is largely documented here to see if there is any demand. If there is, please contact Tore Sinding Bekkedal.

To enable traffic to the tracing service and disable istio-proxy-based tracing, add the following stanza to nais.yaml under "spec":

**TODO: Include code example / screenshot**
