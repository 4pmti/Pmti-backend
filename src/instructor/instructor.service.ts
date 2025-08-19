import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from 'src/country/entities/country.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Instructor } from './entities/instructor.entity';
import { InstructorFilterDto, InstructorStatus } from './dto/intructorfilter.dto';
import { isAdmin } from 'src/common/util/utilities';
import { Role } from 'src/common/enums/role';

@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(Instructor)
    private readonly instructorRepository: Repository<Instructor>,
  ) { }

  async create(userId: string, createInstructorDto: CreateInstructorDto) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId
        }
      });
      //console("admin user", user);

      const existingUser = await this.userRepository.findOne({
        where: {
          email: createInstructorDto.emailID
        }
      });
      if (!existingUser) {
        throw new NotFoundException('User not found with email: ' + createInstructorDto.emailID);
      }

      if (existingUser.roles.includes(Role.INSTRUCTOR)) {
        throw new BadRequestException("This user is already an instructor");
      }

      existingUser.roles.push(Role.INSTRUCTOR)
      await this.userRepository.save(existingUser);
      // now create an instructor table
      const instructor = new Instructor();
      Object.assign(instructor, createInstructorDto);
      instructor.uid = `INS-${Date.now()}`;
      instructor.user = existingUser;
      instructor.addedBy = user;
      instructor.updatedBy = user;
      const savedInstructor = await this.instructorRepository.save(instructor);
      return savedInstructor;

    } catch (error) {
      //console(error);
      throw new InternalServerErrorException(error);
    }
  }

  async findAll(
    filterDto: InstructorFilterDto
  ) {
    try {
      const { nameLike, emailLike, status } = filterDto;

      // Create query builder
      const queryBuilder = this.instructorRepository.createQueryBuilder('instructor');

      // Apply name filter if provided
      if (nameLike) {
        queryBuilder.andWhere('LOWER(instructor.name) LIKE LOWER(:nameLike)', { nameLike: `%${nameLike}%` });
      }

      // Apply email filter if provided
      if (emailLike) {
        queryBuilder.andWhere('LOWER(instructor.emailID) LIKE LOWER(:emailLike)', { emailLike: `%${emailLike}%` });
      }

      // Apply status filter if provided
      if (status && status !== InstructorStatus.ALL) {
        const isActive = status === InstructorStatus.ACTIVE;
        queryBuilder.andWhere('instructor.active = :isActive', { isActive });
      }

      // Execute query
      const instructors = await queryBuilder.getMany();

      return instructors;

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      return await this.instructorRepository.findOne({ where: { id } });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async update(id: number, updateInstructorDto: UpdateInstructorDto, userId: string) {
    try {
      if (!await isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException('You are not authorized to perform this action');
      }
      const instructor = await this.instructorRepository.findOne({ where: { id } });
      if (!instructor) {
        throw new NotFoundException('Instructor not found');
      }
      Object.assign(instructor, updateInstructorDto);
      return await this.instructorRepository.save(instructor);

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async remove(userId: string, id: number) {
    try {
      if (!await isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException('You are not authorized to perform this action');
      }
      const instructor = await this.instructorRepository.findOne({ where: { id } });
      if (!instructor) {
        throw new NotFoundException('Instructor not found');
      }
      return await this.instructorRepository.remove(instructor);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async removeBulk(ids: number[], userId: string) {
    try {
      // Check if the user has admin privileges
      if (!await isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException('You are not authorized to perform this action');
      }

      // Bulk update isDelete to true for the given IDs
      await this.instructorRepository.delete(ids);

      return {
        message: 'Instructors marked as deleted successfully',
        success: true,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to mark instructors as deleted');
    }
  }

}
