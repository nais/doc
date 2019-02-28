Redis
=====

> Redis is an open source (BSD licensed), in-memory data structure store, used as a database, cache and message broker.

On NAIS we are running Redis without disk/storage, so a restart of the Redis cluster will terminate your data. So don't store data that you can't afford to lose. Good use cases for this cluster is to store results of SQL queries that are asked a lot, bad use case is to store user config, or drafts of user inputs that should be persistent. The Redis cluster is also available for all the other applicaiton running in the same Kubernetes cluster as your application.

Read more about Redis sentinels over at [redis.io](https://redis.io/topics/sentinel). Remember that your Redis framework needs to be [sentinel-ready](https://redis.io/topics/sentinel-clients).


## How to

There is two ways to get running with Redis, one for Naisd, and one for Naiserator.


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

Your specific sentinels can then be reached with the following values:

```
url: $REDIS_HOST
port: 26379
master-name: mymaster
```


#### Redis metrics (Grafana)

We have a semi-working dashboard for the Redis-sentinel setup for Naisd, visit [Redis Prometheus](https://grafana.adeo.no/d/MhjMYpmik/prometheus-redis) dashboard on Grafana.


### Naiserator

In Naiserator you are required to manually start your Redis-storage. Luckily this is easily done with `kubectl apply -f redis-config.yaml` sing the config below.

```yaml
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  labels:
    team: <teamnavn>
  name: <appnavn>
  namespace: <namespace>
spec:
  image: redis:5-alpine # or a custom Redis-image
  port: 6379
  replicas: # A single Redis-app doesn't scale
    min: 1
    max: 1
  resources: # you need to monitor need your self
    limits:
      cpu: 250m 
      memory: 256Mi
    requests:
      cpu: 250m
      memory: 256Mi
  service:
    port: 6379
```

In your apps `nais.yaml` you should to add the following environment variable (or hard-code it in your app, they are not going to change):

```yaml
 env:
   - name: REDIS_HOST
     value: <appnavn>.<namespace>.svc.nais.local
```


#### Secure Redis

We have made our own image that uses password from Vault, if this is needed for your projet. See [baseimages](https://github.com/navikt/baseimages/tree/master/secure-redis) for more information.


#### Redis metrics

If you want metrics scraped from you Redis-instance, you need to run your own exporer. You can find the nais.yaml for the simplest version below, and we've also made a dashboard that everyone can use. The only cavete is that the exporter-application needs to end its name with `redisexporter`. The dashboard is called [Redis exporters](https://grafana.adeo.no/d/L-Ktprrmz/redis-exporters).

```
apiVersion: "nais.io/v1alpha1"
kind: "Application"
metadata:
  labels:
    team: <team>
  name: <appname>-redisexporter
  namespace: <namespace>
spec:
  image: oliver006/redis_exporter:v0.29.0-alpine
  port: 9121
  prometheus:
    enabled: true
  replicas:
    min: 1
    max: 1
  resources:
    limits:
      cpu: 100m
      memory: 100Mi
    requests:
      cpu: 100m
      memory: 100Mi
  env:
    - name: REDIS_ADDR
      value: <redis-instance>.default.svc.nais.local:6379
```


## Code example


### Lettuce [Java] - for Redis sentinels

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


### Redis cache in Spring - for Redis sentinels

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
