Redis
=====

> Redis is an open source (BSD licensed), in-memory data structure store, used as a database, cache and message broker.

On NAIS we are running Redis without disk/storage, so a restart of the Redis cluster will terminate your data. So don't store data that you can't afford to lose. Good use cases for this cluster is to store results of SQL queries that are asked a lot, bad use case is to store user config, or drafts of user inputs that should be persistent. The Redis cluster is also available for all the other applicaiton running in the same Kubernetes cluster as your application.

Read more about Redis sentinels over at [redis.io](https://redis.io/topics/sentinel). Remember that your Redis framework needs to be [sentinel-ready](https://redis.io/topics/sentinel-clients).


## How to

There is three ways to get running with Redis, one for Naisd, and two for Naiserator.


### Naisd

In the [NAIS manifest](/documentation/contracts/README.md#nais-manifest) you can add the following configuration to enable Redis:

```yaml
redis:
  enabled: true
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 100m
    memory: 128Mi
```

Your specific sentinels can be then reach with the following values:

```
url: $REDIS_HOST
port: 26379
master-name: mymaster
```


### Naiserator 1

In Naiserator you are required to start your Redis-cluster manually. The simplest is to continue using our Redis-operator. Using `kubectl` you can `apply` the following configuration (substitute variables as needed):

```yaml
apiVersion: storage.spotahome.com/v1alpha2
kind: RedisFailover
metadata:
  labels:
    app: <appnavn>
    environment: <namespace>
    team: <teamnavn>
  name: <appnavn>
  namespace: <namespace>
spec:
  redis:
    exporter: true
    replicas: 3
    resources:
      limits:
        memory: 100Mi
      requests:
        cpu: 100m
  sentinel:
    replicas: 3
    resources:
      limits:
        memory: 100Mi
      requests:
        cpu: 100m
```

You also have to add the `REDIS_HOST` yourself. The URL looks like this: `rfs-<appname>`.


### Naiserator 2

Deploy a simple redis application. Using `kubectl` you can `apply` the following configuration (substitute variables as needed):

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  labels:
    team: <teamnavn>
  name: <appnavn>
  namespace: default
spec:
  image: redis:4.0-alpine # Required. Docker image.
  port: 6379 # Required. The port number which is exposed by the container and should receive TCP traffic.
  team: <teamnavn> # Required. Set to the team that owns this application.
  replicas: # Optional. Set min = max to disable autoscaling.
    min: 1 # minimum number of replicas.
    max: 1 # maximum number of replicas.
    cpuThresholdPercentage: 50 # total cpu percentage threshold on deployment, at which point it will increase number of pods if current < max
  leaderElection: false # Optional. If true, a http endpoint will be available at $ELECTOR_PATH that return the current leader
  preStopHookPath: "" # Optional. A HTTP GET will be issued to this endpoint at least once before the pod is terminated.
  istio: # Optional.
    enabled: false # Optional. When true, envoy-proxy sidecar will be injected into pod and https urls envvars will be rewritten
  resources: # Optional. See: http://kubernetes.io/docs/user-guide/compute-resources/
    limits:
      cpu: 200m # app will have its cpu usage throttled if exceeding this limit
      memory: 512Mi  # app will be killed if exceeding these limits
    requests: # App is guaranteed the requested resources and  will be scheduled on nodes with at least this amount of resources available
      cpu: 100m
      memory: 256Mi
  webproxy: false # Optional. Expose web proxy configuration to the application using the HTTP_PROXY, HTTPS_PROXY and NO_PROXY environment variables.
  secrets: false # Optional. If set to true fetch secrets from Secret Service and inject into the pods. todo link to doc.
```
You also have to add the `REDIS_HOST` yourself. The URL looks like this: `<appnavn>.default.svc.nais.local`.
Due to limitations in naiserator you also have to set `REDIS_PORT` to 80.

## Code example


### Lettuce

Example below is using the Java framework [Lettuce](https://github.com/lettuce-io/lettuce-core).

```java
import static org.springframework.data.redis.connection.lettuce.LettuceConverters.sentinelConfigurationToRedisURI;
import com.lambdaworks.redis.RedisClient;

public class LettuceSentinelTestApplication {

    private static final String MASTER_NAME = "mymaster";
    private static final String EXPECTED_VALUE = "foovalue";
    private static final String REDIS_HOST = System.getenv("REDIS_HOST");

    public static void main(String[] args) {

    	System.out.println("Creating RedisClient instance with sentinel connection");
        RedisClient redisClient = RedisClient.create(sentinelConfigurationToRedisURI(
                        new RedisSentinelConfiguration()
                        .master(MASTER_NAME).sentinel(new RedisNode(REDIS_HOST, 26379)))
                );

        System.out.println("Opening Redis Standalone connection.");
        StatefulRedisConnection<String, String> connection = redisClient.connect();

        System.out.println("Obtain the command API for synchronous execution");
        RedisCommands<String, String> commands = connection.sync();

        System.out.println("Writing...");
        commands.set("foo", EXPECTED_VALUE);

        System.out.println("Reading...");
        String actualValue = commands.get("foo");
        System.out.println("The expected value is: " + EXPECTED_VALUE + ". Actual value is: " + actualValue);

        System.out.println("Closing connection");
        connection.close();
        redisClient.shutdown();
    }
}
```


### Redis cache in Spring

Example below is for setting up Redis Cache in Spring using [Spring-Data-Redis](https://projects.spring.io/spring-data-redis/) Lettuce driver

```java
@Configuration
@EnableCaching
public class CacheConfig {

    private static final String MASTER_NAME = "mymaster";
    private static final String REDIS_HOST = System.getenv("REDIS_HOST");

    @Value("${app.name}")
    private String appName;

    @Bean
    public CacheManager cacheManager(RedisTemplate redisTemplate) {
        RedisCacheManager redisCacheManager = new RedisCacheManager(redisTemplate);
        redisCacheManager.setExpires(TimeUnit.DAYS.toSeconds(2));
        return redisCacheManager;
    }

    @Bean
    public RedisTemplate<?, ?> redisTemplate(LettuceConnectionFactory lettuceConnectionFactory) {
        RedisTemplate<?, ?> redisTemplate = new RedisTemplate();
        redisTemplate.setConnectionFactory(lettuceConnectionFactory);
        return redisTemplate;
    }

    @Bean
    public LettuceConnectionFactory lettuceConnectionFactory() {
        return new LettuceConnectionFactory(new RedisSentinelConfiguration()
                                                            .master(MASTER_NAME)
                                                            .sentinel(new RedisNode(REDIS_HOST, 26379)));
    }
}
```

With the configuration above, the Spring `@Cacheable` annotation can be used to enable caching behaviour on methods. Spring will then use the configuration above to store the cache values to Redis.


#### Spring annotation

Example below shows how to use @Cacheable annotation on a method.
```java
@Cacheable("FOO_CACHE_NAME")
public String getFooFromRepository(String id){
    return repository.getFoo(id);
}
```


#### Losing Redis server connection

Using the Redis Cache configuration in the example might cause problems when the Redis Server is not responding. When the connection to the Redis Server is lost, the LettuceDriver will try to reconnect to the Redis server with a reconnection policy that can cause long response time on the cache requests. This will therefore lead to long responsetime on your application if the cache is heavily used. More advanced example of cache configuration which solves this problem can be found at [gist.github.com/ugur93](https://gist.github.com/ugur93/4e047c03c0d152d245e391d70788829a).
