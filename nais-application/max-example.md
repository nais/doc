---
description: A complete example of all features in nais.yaml
---
# Max example

```
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  name: nais-testapp
  namespace: default
  labels:
    team: aura # Required. Set to the team that owns this application.
spec:
  image: navikt/nais-testapp:65.0.0 # Required. Docker image.
  port: 8080 # Required. The port number which is exposed by the container and should receive HTTP traffic.
  strategy:
    type: RollingUpdate # Recreate and RollingUpdate allowed. Defaults to RollingUpdate
  liveness: # HTTP endpoint that signals 200 OK when the application is running.
    path: isalive
    port: http
    initialDelay: 20
    timeout: 1
    periodSeconds: 5     # How often (in seconds) to perform the probe. Default to 10 seconds
    failureThreshold: 10 # when a Pod starts and the probe fails,
                         # nais will try failureThreshold times before giving up and restarting the Pod
                         # Defaults to 3
  readiness: # HTTP endpoint that signals 200 OK when it is okay to start routing traffic to the application.
    path: isready
    port: http
    initialDelay: 20
    timeout: 1
  replicas: # Optional. Set min = max to disable autoscaling.
    min: 2 # minimum number of replicas.
    max: 4 # maximum number of replicas.
    cpuThresholdPercentage: 50 # total cpu percentage threshold on deployment, at which point it will increase number of pods if current < max
                        # Compare this value with the $HOSTNAME to see if the current instance is the leader
                      # See https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/
  prometheus: # Optional.
    enabled: false # if true the pod will be scraped for metrics by prometheus
    path: /metrics # Path to prometheus-metrics
  resources: # Optional. See: http://kubernetes.io/docs/user-guide/compute-resources/
    limits:
      cpu: 500m # app will have its cpu usage throttled if exceeding this limit
      memory: 512Mi  # app will be killed if exceeding these limits
    requests: # App is guaranteed the requested resources and  will be scheduled on nodes with at least this amount of resources available
      cpu: 200m
      memory: 256Mi
  ingresses: # Optional. List of ingress URLs that will route HTTP traffic to the application.
    - "https://nais-testapp.nais.adeo.no/"
    - "https://tjenester.nav.no/nais-testapp"
  vault:
    enabled: false # Optional. If set to true, fetch secrets from Secret Service and inject into the pods.
    sidecar: false # Optional. If set to true, will extend tokens time to live
    paths:  # Optional. If specified, will override default values with custom Vault configuration.
      - mountPath: /var/run/secrets/nais.io/vault  # Filesystem path inside the pod where secrets will appear.
        kvPath: /kv/preprod/fss/application/namespace  # Vault KV path to fetch secrets from.
  configMaps:
    files: # Optional. Specify config maps that will have their data mounted into the container as files.
      - example_files_configmap
  env:
    - name: MY_CUSTOM_VAR
      value: some_value
  preStopHookPath: "/stop" # Optional. A HTTP GET will be issued to this endpoint at least once before the pod is terminated.
  leaderElection: false # Optional. If true, a http endpoint will be available at $ELECTOR_PATH that return the current leader
  webproxy: false # Optional. Expose web proxy configuration to the application using the HTTP_PROXY, HTTPS_PROXY and NO_PROXY environment variables.
  logformat: accesslog # Optional. The format of the logs from the container. Use this if the container doesn't support json logging and
                       #           the log should be parsed. Supported formats: accesslog, accesslog_with_processing_time,
                       #           accesslog_with_referer_useragent, capnslog, logrus, gokit, redis, glog, simple, influxdb, log15.
  logtransform: http_loglevel # Optional. For accesslogs, set log_level based on http status code
  secureLogs:
    enabled: false # Optional. If true, mount a volume for secure logs in the pod
  service:
    port: 80 # default service-port
  secrets:
    - name: my-secret
      type: env
    - name: my-secret-file
      type: file
      mountPath: /var/run/secrets
  skipCaBundle: false # optional, if true we don't mount any CA Bundles into the application
  accessPolicy:
    inbound:
      rules:
        - application: app1 # allows access from application a in same namespace
        - application: app2
          namespace: q1 # optional, defaults to 'metadata.namespace'
        - application: * # accept inbound traffic from all pods in namespace t1
          namespace: t1 # opens up for all inbound access from 't1' namespace
    outbound:
      rules: # rules for traffic from this application to other
        - application: app4 # allow traffic from this application to app4 in the same namespace
        - application: app1
          namespace: q1
        - application: * # allow traffic from this app to all apps in the t1 namespace
          namespace: t1
      external: # cluster external hosts application needs to access
        - host: www.external-application.com
 ```
