import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity('Country')
  export class  Country {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', length: 255 })
    CountryName: string;
  
    @Column({ type: 'varchar', length: 255 })
    currency: string;
  
    @Column({ type: 'boolean', default: true })
    isActive: boolean;
  
    @Column({ type: 'int', nullable: true })
    addedBy: number;
  
    @Column({ type: 'int', nullable: true })
    updatedBy: number;
  }
  