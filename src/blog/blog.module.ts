import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Student } from 'src/student/entities/student.entity';
import { User } from 'src/user/entities/user.entity';
import { Blog } from './entities/blog.entity';
import { Tag } from './entities/tag.entity';
import { Page } from './entities/page.entity';

@Module({
  controllers: [BlogController],
  providers: [BlogService],
   imports: [TypeOrmModule.forFeature([Student, User,Blog,Tag,Page]), AuthModule]
})
export class BlogModule {}
