import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { Role } from '../enums/role';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';


export async function isAdmin(userId: string, userRepository: Repository<User>): Promise<boolean> {
    const user = await userRepository.findOne({ where: { id: userId } });
    if(!user){ 
        return false;
     }
    return user.roles.includes(Role.ADMIN);
  }
