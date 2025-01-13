import { BaseEntity } from 'src/common/dto/base.dto';
import { Country } from 'src/country/entities/country.entity';
import { State } from 'src/state/entities/state.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('Location')
export class Location extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @ManyToOne(() => Country, (country) => country.locations, { lazy: true })
  country: Promise<Country>; 

  @Column({ type: 'varchar', length: 255 })
  location: string;

  @Column({ type: 'varchar', length: 100 })
  addedBy: string;

  @Column({ type: 'varchar', length: 100 })
  updatedBy: string;

  @Column({ type: 'boolean', default: false })
  isDelete: boolean;

  @ManyToOne(() => State, (state) => state.locations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'state_id' })
  state: State;
}