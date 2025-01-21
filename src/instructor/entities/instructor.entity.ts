import { Class } from 'src/class/entities/class.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToOne, OneToMany } from 'typeorm';

@Entity('Instructor')
export class Instructor {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  emailID: string;

  @Column({ type: 'varchar', length: 15 })
  mobile: string;

  @Column({ type: 'varchar', length: 20 })
  telNo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  billingAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactAddress: string;

  @Column({ type: 'text', nullable: true })
  profile: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'addedBy' })
  addedBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedBy' })
  updatedBy: User;

  @Column({ type: 'boolean', default: false })
  isDelete: boolean;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToOne(() => User, user => user.instructor,{ cascade: true, onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => Class, classEntity => classEntity.instructor,{ cascade: true, onDelete: 'CASCADE' })
  classes: Class[];
}
