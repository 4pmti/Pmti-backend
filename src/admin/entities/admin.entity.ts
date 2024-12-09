import { Country } from 'src/country/entities/country.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
 
  
  @Entity('TB_Admin')
  export class Admin {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', length: 255 })
    name: string;
  
    @Column({ type: 'varchar', length: 255 })
    designation: string;
  
    @Column({ type: 'varchar', length: 15 })
    phone: string;
  
    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;
  
    @ManyToOne(() => Country, (country) => country.CountryId)
    @JoinColumn({ name: 'countryId' })
    country: Country;
  
    @Column({ type: 'boolean', default: false })
    isSuperAdmin: boolean;
  
    @Column({ type: 'boolean', default: true })
    isActive: boolean;
  
    @Column({ type: 'varchar', length: 255 })
    password: string;
  
    @Column({ type: 'datetime', nullable: true })
    lastlogin: Date;
  
    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date;
  
    @UpdateDateColumn({ type: 'datetime' })
    updateAt: Date;
  }
  