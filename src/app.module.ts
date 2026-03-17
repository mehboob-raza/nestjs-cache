import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from '@nestjs/cache-manager';
import { StudentService } from './student/student.service';
import { StudentController } from './student/student.controller';
import { StudentModule } from './student/student.module';
import { redisStore } from 'cache-manager-redis-yet';
import Redis from 'ioredis';

@Module({
  imports: [CacheModule.registerAsync({
    isGlobal: true,
    useFactory: async () => ({
      ttl: 30 * 1000,
      store: await redisStore({
        socket: {
          host: process.env.HOST_NAME || 'localhost',
          port: parseInt(process.env.PORT || '6379'),
        },
      }),
    }),
  }), StudentModule],
  controllers: [AppController, StudentController],
  providers: [
    AppService,
    StudentService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: process.env.HOST_NAME || 'localhost',
          port: parseInt(process.env.PORT || '6379'),
        });
      },
    },
  ],
})
export class AppModule { }
