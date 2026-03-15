import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class StudentService {
  constructor(@Inject('CACHE_MANAGER') private cacheManager: Cache) {}

  async getStudents() {
    const cacheKey = 'students';

    // Try to read from cache first
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      console.log('✅ cache hit (students)');
      return cached;
    }

    console.log('🚀 cache miss, fetching students from "DB"');
    const studentData = await this.retrieveDatafromDB();

    // Store in cache for 30 seconds (override default ttl if needed)
    await this.cacheManager.set(cacheKey, studentData, { ttl: 30 });
    return studentData;
  }

  async retrieveDatafromDB() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const students = [
          { name: 'ali', age: 22 },
          { name: 'aqi', age: 29 },
          { name: 'pli', age: 21 },
        ];
        resolve(students);
      }, 1000);
    });
  }
}
