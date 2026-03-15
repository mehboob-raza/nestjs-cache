import { Controller, Get } from '@nestjs/common';
import { StudentService } from './student.service';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  async getStudent() {
    console.log('Inside Controller');
    return this.studentService.getStudents();
  }
}
