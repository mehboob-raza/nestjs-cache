import { Controller, Get } from '@nestjs/common';
import { StudentService } from './student.service';
import { CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('student')
export class StudentController {
    constructor(private readonly studentService: StudentService) { }

    @Get()
    @CacheKey("KEYY")
    async getStudent() {
        console.log('Inside Controller');
        return this.studentService.getStudents();
    }
}
