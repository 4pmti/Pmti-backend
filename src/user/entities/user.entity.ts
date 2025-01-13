import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany } from 'typeorm';
import { Role } from '../../common/enums/role';
import { Student } from 'src/student/entities/student.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { Instructor } from 'src/instructor/entities/instructor.entity';
import { Promotions } from 'src/promotions/entities/promotion.entity';


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
    type: 'simple-array',
  })
  roles: Role[]; 

  @OneToOne(() => Student, student => student.user)
  student: Student;

  @OneToOne(() => Instructor, instructor => instructor.user)
  instructor: Instructor;

  @OneToOne(() => Admin, admin => admin.user)
  admin: Admin;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Promotions, (promotion) => promotion.addedBy)
  addedPromotions: Promotions[];

  @OneToMany(() => Promotions, (promotion) => promotion.updatedBy)
  updatedPromotions: Promotions[];
}

