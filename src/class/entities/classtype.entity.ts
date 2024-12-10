import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Class } from './class.entity'; // Assuming you have a Class entity

@Entity('ClassType')
export class ClassType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  isDelete: boolean;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToMany(() => Class, (classEntity) => classEntity.classType)
  classes: Class[];  
}
