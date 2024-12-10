import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity('Student')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryGeneratedColumn('uuid')
  uid: string;
  
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  zipCode: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  companyName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  profession: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referredBy: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @CreateDateColumn()
  signupDate: Date;

  @Column({ type: 'boolean', default: false })
  downloadedInfoPac: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  addedBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  updatedBy: string;

  @Column({ type: 'boolean', default: false })
  isDelete: boolean;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @UpdateDateColumn({ nullable: true })
  lastLogin: Date;

  @OneToOne(() => User, user => user.student)
  @JoinColumn()
  user: User;
}
