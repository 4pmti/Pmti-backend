import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from './Category'; // assuming you have a Category entity
import { ClassType } from './ClassType'; // assuming you have a ClassType entity
import { Location } from './Location'; // assuming you have a Location entity
import { Country } from 'src/country/entities/country.entity';
import { Instructor } from 'src/instructor/entities/instructor.entity';


@Entity('Class')
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'categoryID' })
  category: Category;

  @ManyToOne(() => ClassType)
  @JoinColumn({ name: 'classtypeID' })
  classType: ClassType;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'countryID' })
  country: Country;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'locationID' })
  location: Location;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'int' })
  maxStudent: number;

  @Column({ type: 'int' })
  minStudent: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'decimal' })
  price: number;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ManyToOne(() => Instructor)
  @JoinColumn({ name: 'instructorID' })
  instructor: Instructor;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false })
  onlineAvailable: boolean;

  @Column({ type: 'boolean', default: false })
  isCancel: boolean;

  @Column({ type: 'varchar', length: 100 })
  addedBy: string;

  @Column({ type: 'varchar', length: 100 })
  updatedBy: string;

  @Column({ type: 'boolean', default: false })
  isDelete: boolean;

  @Column({ type: 'varchar', length: 100 })
  classTime: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  onlineCourseId: string;

  @Column({ type: 'boolean', default: false })
  isCorpClass: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hotel: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hotelEmailId: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  hotelContactNo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  flightConfirmation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  carConfirmation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hotelConfirmation: string;
}
