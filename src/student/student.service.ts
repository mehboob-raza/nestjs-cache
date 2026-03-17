import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class StudentService {
    // Inject the Redis client directly for caching operations
    // This provides direct access to Redis commands without the cache-manager abstraction
    constructor(@Inject('REDIS_CLIENT') private redisClient: Redis) { }

    async getStudents() {
      

        // Define a unique cache key for this data
        const cacheKey = 'students';

        // Try to get data from Redis cache first
        // redisClient.get() returns the cached value as string or null if not found
        const cachedData = await this.redisClient.get(cacheKey);

        // If data exists in cache, parse it from JSON and return (cache hit)
        if (cachedData) {
            console.log('Returning cached data from Redis');
            return JSON.parse(cachedData);
        }
          if (!cachedData) {
            console.log('Inside Services');
        }

        // Cache miss: fetch data from the database
        const studentData = await this.retrieveDatafromDB();

        // Store the data in Redis cache with a TTL of 1 minute (60 seconds)
        // redisClient.setex(key, ttl, value) - sets key with expiration
        await this.redisClient.setex(cacheKey, 60, JSON.stringify(studentData));

        return studentData;
    }

    // Simulates a database call with artificial delay
    async retrieveDatafromDB() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const students = [
                    { name: 'ali', age: 22 },
                    { name: 'aqi', age: 29 },
                    { name: 'pli', age: 21 },
                ]
                resolve(students)
            }, 1000) // 1 second delay to simulate DB query
        })
    }
}
