# Redis

> Redis is an open source \(BSD licensed\), in-memory data structure store, used as a database, cache and message broker.

If your application needs a Redis database available, you can enable it by adding `redis: true` in your [NAIS manifest](https://github.com/nais/doc/tree/8c67c55b42d6da64d90f83effa058ac58e70d79c/documentation/contracts/README.md#nais-manifest). By setting this the value `redis` to `true`, [Naisd](https://github.com/nais/doc/tree/8c67c55b42d6da64d90f83effa058ac58e70d79c/documentation/dev-guide/naisd.md) will start a small cluster of pods with Redis masters and sentinels. For now, we are running Redis without disk, so a restart of the Redis cluster will terminate your data. So don't store data that you can't afford to lose. Good use cases for this cluster is to store results of SQL queries that are asked a lot, bad use case is to store user config, or drafts of user inputs that should be persistent. The Redis cluster is also available for all the other applicaiton running in the same Kubernetes cluster as your application.

Read more about Redis sentinels over at [redis.io](https://redis.io/topics/sentinel). Remember that your Redis framework needs to be [sentinel-ready](https://redis.io/topics/sentinel-clients).

Your specific sentinels can be reach with the following values:

```text
url: $REDIS_HOST
port: 26379
master-name: mymaster
```

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

### Losing Redis server connection

Using the Redis Cache configuration in the example might cause problems when the Redis Server is not responding. When the connection to the Redis Server is lost, the LettuceDriver will try to reconnect to the Redis server with a reconnection policy that can cause long response time on the cache requests. This will therefore lead to long responsetime on your application if the cache is heavily used. More advanced example of cache configuration which solves this problem can be found at [gist.github.com/ugur93](https://gist.github.com/ugur93/4e047c03c0d152d245e391d70788829a).

