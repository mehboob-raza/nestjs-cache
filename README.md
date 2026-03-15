# NestJS Cache + Redis Demo

This repository demonstrates how to use **NestJS caching** with **Redis** using `cache-manager` + `cache-manager-redis-yet`.

You will learn how to:
- Run Redis locally via Docker
- Connect NestJS cache module to Redis
- Use `CACHE_MANAGER` for manual caching in services
- Inspect cache keys using RedisInsight

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

## 3) Start the NestJS app

```bash
pnpm start:dev
```

The app will be available at:
- `http://localhost:3000/student`

---

## 4) How caching is wired (code walkthrough)

### ✅ CacheModule with Redis store

In `src/app.module.ts` we configure caching globally with Redis:

- Uses `@nestjs/cache-manager` and `cache-manager-redis-yet`
- Uses env vars for Redis connection
- Uses a global cache TTL (default is 30 seconds)

```ts
CacheModule.registerAsync({
  isGlobal: true,
  useFactory: () => ({
    store: redisStore,
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
    ttl: 30, // seconds
  }),
});
```

### ✅ Manual cache usage in a service

In `src/student/student.service.ts` we use the injected `CACHE_MANAGER`:
- Try reading the cached value first
- If missing, fetch from the “DB” (simulated delay)
- Write the response back into Redis with a TTL

---

## 5) Verify cache behavior

1) Start the server:

```bash
pnpm start:dev
```

2) Call the endpoint twice:

```bash
curl http://localhost:3000/student
curl http://localhost:3000/student
```

- First request: cache miss (will log `cache miss` in console)
- Second request: cache hit (will log `cache hit`)

---

## 6) Inspect Redis from RedisInsight

1) Add a new Redis connection using:
   - Host: `localhost`
   - Port: `6379`

2) Look for the key: `students`

You can also run:

```bash
redis-cli -h localhost -p 6379 GET students
```

---

## 7) Customization & tips

- Change TTL in `src/app.module.ts` (seconds)
- Change Redis host/port via env vars:
  - `REDIS_HOST`
  - `REDIS_PORT`
- If you want per-route caching, use `CacheInterceptor` from `@nestjs/cache-manager`.

---

## Useful links

- NestJS caching docs: https://docs.nestjs.com/techniques/caching
- cache-manager-redis-yet: https://github.com/TimoStaudinger/cache-manager-redis-yet
- RedisInsight: https://redis.com/redis-enterprise/redis-insight/
