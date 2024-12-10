import { Module } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { InstructorController } from './instructor.controller';
import { Instructor } from './entities/instructor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [InstructorController],
  providers: [InstructorService],
  imports:[ TypeOrmModule.forFeature([Instructor]), ]
})
export class InstructorModule {}
