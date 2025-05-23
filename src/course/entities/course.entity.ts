import { Category } from 'src/class/entities/category.entity';
import { ClassType } from 'src/class/entities/classtype.entity';
import { BaseEntity } from 'src/common/dto/base.dto';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { User } from 'src/user/entities/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
  } from 'typeorm';
  
  @Entity('courses')
  export class Course extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Category)
    category: Category;
  
    @Column({ type: 'varchar', length: 255, nullable: false })
    courseName: string;

  
    @Column({ type: 'varchar', length: 100, nullable: false })
    shortName: string;
  
    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'text', nullable: true })
    coverImage: string;
  
    @Column({ type: 'boolean', default: false })
    isGuestAccess: boolean;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'createdBy' })
    createdBy: User;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'updatedBy' })
    updatedBy: User;
  
    @Column({ type: 'boolean', default: true })
    isVisible: boolean;
  
    @Column({ type: 'boolean', default: false })
    isDelete: boolean;
  
    @Column({ type: 'int', nullable: true })
    courseDuration: number; // Assuming duration is in hours or similar units
  
    @ManyToOne(() => ClassType)
    @JoinColumn({ name: 'classType' })
    classType: ClassType;
  
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number;
  
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    extPrice: number;

    @OneToMany(() => Enrollment, enrollment => enrollment.course)
    enrollments: Enrollment[];
  }
  