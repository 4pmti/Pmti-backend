import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/common/enums/role';

@Injectable()
export class AdminService {


  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,

    @InjectRepository(User)
    private readonly userRepository:Repository<User>
  ) { }
  create(createAdminDto: CreateAdminDto) {
    try {

    } catch (error) {

    }
  }

  async findAll() {
    try {
      const excludeFields = ['password', 'createdAt'];
      const allFields = this.adminRepository.metadata.columns.map((col) => col.propertyName);
      const includedFields = allFields.filter((field) => !excludeFields.includes(field));

      return await this.adminRepository.find({
        select: Object.fromEntries(includedFields.map((field) => [field, true])),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const admin = await this.adminRepository.findOne({
        where: {
          id: id
        }
      });
      return admin;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

 async update(id: number, userId: string, updateAdminDto: UpdateAdminDto) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: userId
        }
      });
      if (!user) {
        throw new UnauthorizedException("Invalid User");
      }
      if (!user.roles.includes(Role.ADMIN)) {
        throw new ForbiddenException("You don't have this permission!");
      }

      const admin = await this.adminRepository.findOne({
        where: {
          id: id
        }
      });
      if (!admin) {
        throw new NotFoundException("Admin not Found");
      }
      Object.assign(admin, updateAdminDto);

    
      const updatedAdmin = await this.adminRepository.save(admin);
  
      return updatedAdmin;

    } catch (error) { 
      console.log(error);
      throw error;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} admin`;
  }
}
