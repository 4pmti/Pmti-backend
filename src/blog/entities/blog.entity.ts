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
  cover_image: string

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({})
  slug: string

  @Column({ type: 'text', nullable: true })
  head :string

  @Column({ type: 'text', nullable: true })
  style: string


  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => User, (user) => user.blogs, { onDelete: 'CASCADE' })
  user: User;

  @ManyToMany(() => Tag, (tag) => tag.blogs, { cascade: true })
  @JoinTable()
  tags: Tag[];
}
