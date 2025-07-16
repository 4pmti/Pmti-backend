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
import { BaseEntity } from 'src/common/dto/base.dto';
import { Page } from './page.entity';

@Entity()
export class Blog  extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cover_image: string

  @Column()
  thumbnail: string

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

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany(() => Tag, (tag) => tag.blogs, { cascade: true })
  @JoinTable()
  tags: Tag[];

  // Related articles - many-to-many self-relationship
  @ManyToMany(() => Blog, (blog) => blog.relatedTo, { cascade: true })
  @JoinTable({
    name: 'blog_related_articles',
    joinColumn: { name: 'blog_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'related_blog_id', referencedColumnName: 'id' }
  })
  relatedArticles: Blog[];

  @ManyToMany(() => Blog, (blog) => blog.relatedArticles)
  relatedTo: Blog[];

  @ManyToMany(() => Page, (page) => page.blogs, { cascade: true })
  @JoinTable()
  pages: Page[];
}
