# NestJS Cache + Redis Implementation

This repository demonstrates a complete **NestJS caching** implementation with **Redis** using `cache-manager` + `cache-manager-redis-yet` and direct `ioredis` client for advanced operations.

You will learn how to:
- Run Redis locally via Docker
- Connect NestJS cache module to Redis with async configuration
- Use direct Redis client for manual caching in services
- Implement cache invalidation and advanced caching patterns
- Inspect cache keys using RedisInsight
- Set up proper module structure and error handling

---

## ✅ Prerequisites

- Node.js (>= 18)
- pnpm
- Docker (for Redis + RedisInsight)

---

## 1) Install dependencies

From the `impl-cache` folder:

```bash
pnpm install
```

---

## 2) Run Redis (Docker)

```bash
docker run -d --name redis-local -p 6379:6379 redis:latest
```

### (Optional) Run RedisInsight

```bash
docker run -d --name redisinsight -p 8001:8001 redislabs/redisinsight:latest
```

Then open:
- RedisInsight: `http://localhost:8001`
- Redis CLI (from host): `redis-cli -h localhost -p 6379`

---

## 3) Environment Configuration

Create a `.env` file in the root directory:

```env
HOST_NAME=localhost
PORT=6379
```

---

## 4) Start the NestJS app

```bash
pnpm start:dev
```

The app will be available at:
- `http://localhost:3000/student`

---

## 4) How caching is wired (code walkthrough)

### ✅ CacheModule with Redis store

In `src/app.module.ts` we configure caching globally with Redis using the latest async API:

- Uses `@nestjs/cache-manager` and `cache-manager-redis-yet`
- Uses env vars for Redis connection (`HOST_NAME`, `PORT`)
- Global cache TTL of 30 seconds (configurable)
- Provides both CacheManager and direct Redis client

```ts
CacheModule.registerAsync({
  isGlobal: true,
  useFactory: async () => ({
    ttl: 30 * 1000, // 30 seconds in milliseconds
    store: await redisStore({
      socket: {
        host: process.env.HOST_NAME,
        port: parseInt(process.env.PORT || '6379'),
      },
    }),
  }),
});

// Direct Redis client for advanced operations
{
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    return new Redis({
      host: 'localhost',
      port: 6379,
    });
  },
}
```

### ✅ Manual cache usage with direct Redis client

In `src/student/student.service.ts` we use the injected Redis client for full control:
- Direct Redis operations for complex caching logic
- Custom TTL management per operation
- Cache key management and invalidation
- Error handling and logging

```ts
@Injectable()
export class StudentService {
  constructor(@Inject('REDIS_CLIENT') private redisClient: Redis) {}

  async getStudents() {
    const cacheKey = 'students';
    const cachedData = await this.redisClient.get(cacheKey);

    if (cachedData) {
      console.log('Cache hit - returning cached data');
      return JSON.parse(cachedData);
    }

    console.log('Cache miss - fetching from database');
    const studentData = await this.retrieveDatafromDB();

    // Cache with 60 second TTL
    await this.redisClient.setex(cacheKey, 60, JSON.stringify(studentData));

    return studentData;
  }
}
```

---

## 6) Verify cache behavior

1) Start the server:

```bash
pnpm start:dev
```

2) Call the endpoint twice:

```bash
curl http://localhost:3000/student
curl http://localhost:3000/student
```

- First request: cache miss (logs "Cache miss - fetching from database")
- Second request: cache hit (logs "Cache hit - returning cached data")

---

## 7) Inspect Redis from RedisInsight

1) Add a new Redis connection using:
   - Host: `localhost`
   - Port: `6379`

2) Look for the key: `students`

You can also run:

```bash
redis-cli -h localhost -p 6379 GET students
```

---

## 8) Advanced Caching Features

### Cache Invalidation

```ts
// Invalidate specific key
await this.redisClient.del('students');

// Invalidate multiple keys with pattern
const keys = await this.redisClient.keys('student:*');
if (keys.length > 0) {
  await this.redisClient.del(...keys);
}
```

### Different TTL Strategies

```ts
// Short-term cache (5 minutes)
await this.redisClient.setex('frequent_data', 300, data);

// Long-term cache (1 hour)
await this.redisClient.setex('static_data', 3600, data);

// No expiration
await this.redisClient.set('permanent_data', data);
```

### Health Check

```bash
curl http://localhost:3000/health
```

---

## API Endpoints

### Student Endpoints
- `GET /student` - Get all students (cached for 60 seconds)
- `GET /student/short-term` - Get students with short-term cache (5 minutes)
- `GET /student/long-term` - Get students with long-term cache (1 hour)
- `GET /student/:id` - Get student by ID (cached for 10 minutes)
- `POST /student/invalidate` - Invalidate students cache
- `DELETE /student/invalidate-all` - Invalidate all student-related caches
- `GET /student/cache-info` - Get cache information and statistics

### Health Check Endpoints
- `GET /health` - General health check including Redis status
- `GET /health/redis` - Detailed Redis health information

---

## Complete Implementation Roadmap

### ✅ Phase 1: Basic Setup
- [x] Install dependencies (@nestjs/cache-manager, cache-manager-redis-yet, ioredis)
- [x] Configure Redis connection with environment variables
- [x] Set up CacheModule with async configuration
- [x] Create basic StudentModule with service and controller

### ✅ Phase 2: Core Caching Implementation
- [x] Implement direct Redis client injection
- [x] Add basic caching in StudentService
- [x] Create cache hit/miss logging
- [x] Test cache behavior with multiple requests

### ✅ Phase 3: Advanced Features
- [x] Add cache invalidation methods
- [x] Implement different TTL strategies (short-term, long-term)
- [x] Add key-based caching for individual items
- [x] Create cache management endpoints

### ✅ Phase 4: Production Readiness
- [x] Add error handling and connection retry logic
- [x] Implement health check endpoints
- [x] Add Redis event listeners for monitoring
- [x] Configure proper module structure and exports

### ✅ Phase 5: Monitoring & Maintenance
- [x] Add cache statistics and info endpoints
- [x] Implement graceful error handling with fallbacks
- [x] Add comprehensive logging
- [x] Update documentation with complete examples

---

## 9) Customization & Best Practices

- **Environment Variables**: Use `HOST_NAME` and `PORT` for Redis connection
- **TTL Management**: Set appropriate TTLs based on data freshness requirements
- **Key Naming**: Use consistent patterns like `entity:id` or `collection:*`
- **Error Handling**: Always handle Redis connection failures gracefully
- **Monitoring**: Use RedisInsight for cache monitoring and debugging
- **Connection Pooling**: ioredis handles connection pooling automatically

---

## 10) Production Considerations

- Use Redis Sentinel or Redis Cluster for high availability
- Implement proper logging and monitoring
- Set up Redis persistence (RDB/AOF)
- Configure memory limits and eviction policies
- Use Redis authentication in production
- Implement circuit breakers for Redis failures

---

## Useful links

- NestJS caching docs: https://docs.nestjs.com/techniques/caching
- cache-manager-redis-yet: https://github.com/TimoStaudinger/cache-manager-redis-yet
- ioredis documentation: https://redis.github.io/ioredis/
- RedisInsight: https://redis.com/redis-enterprise/redis-insight/
