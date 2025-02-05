import {
    Column,
    Entity,
    ManyToMany,
    JoinTable,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  import { Tag } from './tag.entity';
import { User } from 'src/user/entities/user.entity';
  
  @Entity()
  export class Blog {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column()
    title: string;
  
    @Column('text')
    content: string;
  
    @ManyToOne(() => User, (user) => user.blogs, { onDelete: 'CASCADE' })
    user: User;
  
    @ManyToMany(() => Tag, (tag) => tag.blogs, { cascade: true })
    @JoinTable()
    tags: Tag[];
  }
  