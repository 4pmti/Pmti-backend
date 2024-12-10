import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Instructor')
export class Instructor {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ type: 'varchar', length: 100 })
  addedBy: string;

  @Column({ type: 'varchar', length: 100 })
  updatedBy: string;

  @Column({ type: 'boolean', default: false })
  isDelete: boolean;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
