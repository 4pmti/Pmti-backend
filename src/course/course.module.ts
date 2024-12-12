import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { ClassType } from 'src/class/entities/classtype.entity';
import { Category } from 'src/class/entities/category.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Course } from './entities/course.entity';

@Module({
  controllers: [CourseController],
  providers: [CourseService],
  imports :[TypeOrmModule.forFeature([User,ClassType,Category,Course]),AuthModule]
})
export class CourseModule {}
