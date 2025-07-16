import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { BaseEntity } from 'src/common/dto/base.dto';
import { Blog } from './blog.entity';

@Entity('blog_page')
export class Page extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
  
  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany(() => Blog, (blog) => blog.pages)
  blogs: Blog[];
} 