import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Student } from 'src/student/entities/student.entity';
import { Repository } from 'typeorm';
import { BcryptService } from 'src/common/util/bcrypt.service';
import { CreateAdminDto } from 'src/admin/dto/create-admin.dto';
import { CreateStudentDto } from 'src/student/dto/create-student.dto';
import { Role } from 'src/common/enums/role';
import { Admin } from 'src/admin/entities/admin.entity';
import { Country } from 'src/country/entities/country.entity';
import { ResponseDto } from 'src/common/dto/response.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Student)
        private studentsRepository: Repository<Student>,
        // @InjectRepository(Teacher)
        // private teachersRepository: Repository<Teacher>,
        @InjectRepository(Admin)
        private adminsRepository: Repository<Admin>,

        @InjectRepository(Country)
        private countryRepository: Repository<Country>,
        private bcryptService: BcryptService,
    ) { }

    //   async createStudent(createStudentDto: CreateStudentDto): Promise<Student> {
    //     const user = new User();
    //     user.firstName = createStudentDto.firstName;
    //     user.lastName = createStudentDto.lastName;
    //     user.email = createStudentDto.email;
    //     user.role = UserRole.STUDENT;
    //     user.password = await this.bcryptService.hashPassword(createStudentDto.password);

    //     const savedUser = await this.usersRepository.save(user);

    //     const student = new Student();
    //     student.studentId = `STU-${Date.now()}`;
    //     student.grade = createStudentDto.grade;
    //     student.parentPhone = createStudentDto.parentPhone;
    //     student.dateOfBirth = createStudentDto.dateOfBirth;
    //     student.user = savedUser;

    //     return this.studentsRepository.save(student);
    //   }

    //   async createTeacher(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    //     const user = new User();
    //     user.firstName = createTeacherDto.firstName;
    //     user.lastName = createTeacherDto.lastName;
    //     user.email = createTeacherDto.email;
    //     user.role = UserRole.TEACHER;
    //     user.password = await this.bcryptService.hashPassword(createTeacherDto.password);

    //     const savedUser = await this.usersRepository.save(user);

    //     const teacher = new Teacher();
    //     teacher.teacherId = `TEA-${Date.now()}`;
    //     teacher.subject = createTeacherDto.subject;
    //     teacher.qualification = createTeacherDto.qualification;
    //     teacher.experience = createTeacherDto.experience;
    //     teacher.user = savedUser;

    //     return this.teachersRepository.save(teacher);
    //   }

    async createAdmin(createAdminDto: CreateAdminDto) {
        const country = await this.countryRepository.findOne({ where: { id: createAdminDto.countryId } });
        if (!country) {
            throw new UnauthorizedException('Country not found');
        }

        const checkExistinguser = await this.usersRepository.findOne({ where: { email: createAdminDto.email } });
        if (checkExistinguser) {
            throw new Error("This Email Already Exists");
        }

        const user = new User();
        user.name = createAdminDto.name;

        user.email = createAdminDto.email;
        user.role = Role.ADMIN;
        user.password = await this.bcryptService.hashPassword(createAdminDto.password);

        const savedUser = await this.usersRepository.save(user);
        const admin = new Admin();
        admin.name = createAdminDto.name;
        admin.designation = createAdminDto.designation;
        admin.country = country;
        admin.email = createAdminDto.email,
        admin.phone = createAdminDto.phone,
        admin.password = savedUser.password,
        admin.isActive = true;
        admin.uid = `ADM-${Date.now()}`;
        admin.user = savedUser;
        return await this.adminsRepository.save(admin);
    }
}


