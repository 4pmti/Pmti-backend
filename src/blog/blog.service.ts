import { Injectable, NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { Role } from 'src/common/enums/role';
import { Tag } from './entities/tag.entity';
import { FilterBlogDto } from './dto/filter-blog.dto';
import { isAdmin } from 'src/common/util/utilities';


@Injectable()
export class BlogService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) { }

  async create(userId: string, createBlogDto: CreateBlogDto) {
    try {

      const user = await this.userRepository.findOne({
        where: {
          id: userId
        }
      });
      if (!user) throw new NotFoundException('User not found');
      if (!user.roles.includes(Role.ADMIN)
        && !user.roles.includes(Role.INSTRUCTOR)
      ) {
        throw new UnauthorizedException("You dont have enough permission to do this");
      }

      const tags = await Promise.all(
        createBlogDto.tagNames.map(async (name) => {
          let tag = await this.tagRepo.findOne({ where: { name } });
          if (!tag) {
            tag = this.tagRepo.create({ name });
            await this.tagRepo.save(tag);
          }
          return tag;
        })
      );

      const blog = this.blogRepository.create({
        tags: tags,
        title: createBlogDto.title,
        content: createBlogDto.content,
        cover_image: createBlogDto.coverImage,
        user: user,
        slug: createBlogDto.slug
      });
      return this.blogRepository.save(blog);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(filter: FilterBlogDto) {
    try {
      const { page = 1, limit = 10, search, tags, userId } = filter;

      const query = this.blogRepository.createQueryBuilder('blog')
        .leftJoinAndSelect('blog.tags', 'tag')
        .leftJoinAndSelect('blog.user', 'user')
        .skip((page - 1) * limit)
        .take(limit);

      if (search) {
        query.andWhere('(LOWER(blog.title) LIKE LOWER(:search) OR LOWER(blog.content) LIKE LOWER(:search))', { search: `%${search}%` });
      }

      if (tags && tags.length > 0) {
        query.andWhere('tag.name IN (:...tags)', { tags });
      }

      if (userId) {
        query.andWhere('user.id = :userId', { userId });
      }

      const [blogs, total] = await query.getManyAndCount();

      return {
        data: blogs,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (e) {
      console.log(e);
      throw e;
    }

  }

  async findOne(id: number) {
    try {


      const blog = await this.blogRepository.findOne({
        where: {
          id
        },
        relations: {
          tags: true,
          user: true
        }
      });

      if (!blog) {
        throw new NotFoundException("Blog Not Found"
        );
      }
      return blog;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(userId: string, id: number, updateBlogDto: UpdateBlogDto) {
    try {

      if (!await isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException("You dont have enough permission to do this");
      }

      const user = await this.userRepository.findOne({
        where: {
          id: userId
        }
      });

      if (!user) {
        throw new UnauthorizedException("User not found!");
      }
      const blog = await this.blogRepository.findOne({
        where: {
          id
        },
        relations: {
          user: true
        }
      });
      console.log(blog);
      if (!blog) {
        throw new NotFoundException('Blog not found!');
      }
      console.log(user);
      if (blog.user.id != user.id) {
        throw new UnauthorizedException("This action is not allowed!");
      }
      console.log(id);

      // Update the blog
      await this.blogRepository.update(id, updateBlogDto);

      // Fetch updated blog
      const updatedBlog = await this.blogRepository.findOne({ where: { id } });

      return updatedBlog;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.blogRepository.delete(id);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
