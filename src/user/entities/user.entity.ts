import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Role } from '../../common/enums/role';
import { Student } from 'src/student/entities/student.entity';
import { Admin } from 'src/admin/entities/admin.entity';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role: Role;

  @OneToOne(() => Student, student => student.user)
  student: Student;

//   @OneToOne(() => Teacher, teacher => teacher.user)
//   teacher: Teacher;

  @OneToOne(() => Admin, admin => admin.user)
  admin: Admin;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

