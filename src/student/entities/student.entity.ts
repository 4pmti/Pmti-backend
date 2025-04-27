import { Country } from 'src/country/entities/country.entity';
import { State } from 'src/state/entities/state.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Location } from 'src/location/entities/location.entity';

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

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'locationID' })
  city: Location;

  @Column({ type: 'varchar', length: 255, nullable: true })
  state: string;

  
  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryID' })
  country: Country;


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

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'AddedBy' })
  AddedBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'UpdatedBy' })
  UpdatedBy: User;

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
