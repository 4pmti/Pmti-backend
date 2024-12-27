import { Category } from 'src/class/entities/category.entity';
import { ClassType } from 'src/class/entities/classtype.entity';
import { BaseEntity } from 'src/common/dto/base.dto';
import { Country } from 'src/country/entities/country.entity';
import { User } from 'src/user/entities/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';

  @Entity('promotions')
  export class Promotions extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Country, (country) => country.promotions, { eager: true })
    @JoinColumn({ name: 'countryId' })
    country: Country;
  
    @ManyToOne(() => Category, (category) => category.promotions, { eager: true })
    @JoinColumn({ name: 'categoryId' })
    category: Category;
  
    @ManyToOne(() => ClassType, (classType) => classType.promotions, { eager: true })
    @JoinColumn({ name: 'classTypeId' })
    classType: ClassType;
  
    @Column({ unique: true })
    promotionId: string;
  
    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;
  
    @Column({ type: 'timestamp' })
    startDate: Date;
  
    @Column({ type: 'timestamp' })
    endDate: Date;
  
    @Column({ length: 255 })
    title: string;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @Column({ nullable: true })
    attachedFilePath: string;
  
    @ManyToOne(() => User, (user) => user.addedPromotions, { eager: false })
    @JoinColumn({ name: 'addedBy' })
    addedBy: User;
  
    @ManyToOne(() => User, (user) => user.updatedPromotions, { eager: false })
    @JoinColumn({ name: 'updatedBy' })
    updatedBy: User;
  
    @Column({ default: false })
    isDelete: boolean;
  
    @Column({ default: true })
    active: boolean;
  
    @Column()
    promotionType: number;
  
  }
  