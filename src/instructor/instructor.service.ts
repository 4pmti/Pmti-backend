import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from 'src/country/entities/country.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Instructor } from './entities/instructor.entity';
import { InstructorFilterDto, InstructorStatus } from './dto/intructorfilter.dto';
import { isAdmin } from 'src/common/util/utilities';

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

  create(createInstructorDto: CreateInstructorDto) {
    return 'This action adds a new instructor';
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
      if (!isAdmin(userId, this.userRepository)) {
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
      if (!isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException('You are not authorized to perform this action');
      }
      return await this.instructorRepository.delete(id);

    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async removeBulk(ids: number[], userId: string) {
    try {
      if (!isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException('You are not authorized to perform this action');
      }
      return await this.instructorRepository.delete(ids);

    } catch (error) {

    }
  }
}
