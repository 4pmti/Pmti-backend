import { Country } from 'src/country/entities/country.entity';
import { Location } from 'src/location/entities/location.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
  } from 'typeorm';

  
  @Entity('state')
  export class State {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', length: 100 ,unique:true })
    name: string;
  
    @ManyToOne(() => Country, (country) => country.states, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'country_id' })
    country: Country;
  
    @OneToMany(() => Location, (location) => location.state)
    locations: Location[];
  }
  