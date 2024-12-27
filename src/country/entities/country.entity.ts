import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Location } from 'src/location/entities/location.entity';
import { Promotions } from 'src/promotions/entities/promotion.entity';

@Entity('Country')
export class Country {
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

  @OneToMany(() => Location, (location) => location.country, { lazy: true })
  locations: Promise<Location[]>;

  @OneToMany(() => Promotions, (promotion) => promotion.country)
  promotions: Promotions[];


  @Column({ type: 'int', nullable: true })
  updatedBy: number;
}
  