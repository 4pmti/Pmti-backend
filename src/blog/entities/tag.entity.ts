import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Blog } from './blog.entity';

@Entity('blog_tag')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Blog, (blog) => blog.tags)
  blogs: Blog[];
}
