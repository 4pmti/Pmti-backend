import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, UseGuards } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { FilterPageDto } from './dto/filter-page.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { In, Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { Page } from './entities/page.entity';
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
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
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

      console.log({ createBlogDto });

      // Handle tags
      const tags = await Promise.all(
        createBlogDto.tagNames?.map(async (name) => {
          let tag = await this.tagRepo.findOne({ where: { name } });
          if (!tag) {
            tag = this.tagRepo.create({ name });
            await this.tagRepo.save(tag);
          }
          return tag;
        }) || []
      );

      // Handle related articles
      let relatedArticles: Blog[] = [];
      if (createBlogDto.relatedArticleIds && createBlogDto.relatedArticleIds.length > 0) {
        relatedArticles = await this.blogRepository.findByIds(createBlogDto.relatedArticleIds);

        // Validate that all related articles exist
        if (relatedArticles.length !== createBlogDto.relatedArticleIds.length) {
          const foundIds = relatedArticles.map(article => article.id);
          const missingIds = createBlogDto.relatedArticleIds.filter(id => !foundIds.includes(id));
          throw new NotFoundException(`Related articles not found with IDs: ${missingIds.join(', ')}`);
        }
      }

      // Handle pages
      let pages: Page[] = [];
      if (createBlogDto.pageIds && createBlogDto.pageIds.length > 0) {
        pages = await this.pageRepository.findByIds(createBlogDto.pageIds);

        // Validate that all pages exist
        if (pages.length !== createBlogDto.pageIds.length) {
          const foundIds = pages.map(page => page.id);
          const missingIds = createBlogDto.pageIds.filter(id => !foundIds.includes(id));
          throw new NotFoundException(`Pages not found with IDs: ${missingIds.join(', ')}`);
        }
      }

      const blog = this.blogRepository.create({
        tags: tags,
        title: createBlogDto.title,
        content: createBlogDto.content,
        metadata: createBlogDto.metadata,
        cover_image: createBlogDto.coverImage,
        thumbnail: createBlogDto.thumbnail,
        user: user,
        slug: createBlogDto.slug,
        description: createBlogDto.description,
        relatedArticles: relatedArticles,
        pages: pages
      });

      return await this.blogRepository.save(blog);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async findAll(filter: FilterBlogDto) {
    try {
      const { page = 1, limit = 10, search, tags, userId, slug, pageId, pageName } = filter;

      const query = this.blogRepository.createQueryBuilder('blog')
        .leftJoinAndSelect('blog.tags', 'tag')
        .leftJoinAndSelect('blog.user', 'user')
        .leftJoinAndSelect('blog.pages', 'page')
        .leftJoin('blog.relatedArticles', 'relatedArticle')
        .addSelect('relatedArticle.id')
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

      if (slug) {
        query.andWhere('blog.slug = :slug', { slug });
      }

      if (pageId) {
        query.andWhere('page.id = :pageId', { pageId });
      }

      if (pageName) {
        query.andWhere('page.name = :pageName', { pageName });
      }

      const [blogs, total] = await query.getManyAndCount();

      // Transform related articles to only include IDs
      const transformedBlogs = blogs.map(blog => ({
        ...blog,
        relatedArticleIds: blog.relatedArticles?.map(article => article.id) || []
      }));

      // Remove the full relatedArticles objects
      transformedBlogs.forEach(blog => {
        delete blog.relatedArticles;
      });

      return {
        data: transformedBlogs,
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
          user: true,
          relatedArticles: true,
          pages: true
        }
      });

      if (!blog) {
        throw new NotFoundException("Blog Not Found");
      }

      // Transform related articles to only include IDs
      const transformedBlog = {
        ...blog,
        relatedArticleIds: blog.relatedArticles?.map(article => article.id) || []
      };

      // Remove the full relatedArticles object
      delete transformedBlog.relatedArticles;

      return transformedBlog;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(userId: string, id: number, updateBlogDto: UpdateBlogDto) {
    console.log(`[BlogService.update] Starting blog update - userId: ${userId}, blogId: ${id}`);

    try {
      console.log(`[BlogService.update] Checking admin permissions for user: ${userId}`);
      if (!await isAdmin(userId, this.userRepository)) {
        console.log(`[BlogService.update] Permission denied - user ${userId} is not admin`);
        throw new UnauthorizedException("You dont have enough permission to do this");
      }
      console.log(`[BlogService.update] Admin permission check passed`);

      console.log(`[BlogService.update] Fetching user details for userId: ${userId}`);
      const user = await this.userRepository.findOne({
        where: {
          id: userId
        }
      });

      if (!user) {
        console.log(`[BlogService.update] User not found with id: ${userId}`);
        throw new UnauthorizedException("User not found!");
      }
      console.log(`[BlogService.update] User found - id: ${user.id}, roles: ${user.roles}`);

      console.log(`[BlogService.update] Fetching blog details for blogId: ${id}`);
      const blog = await this.blogRepository.findOne({
        where: {
          id
        },
        relations: {
          user: true,
          tags: true,
          relatedArticles: true,
          pages: true
        }
      });

      if (!blog) {
        console.log(`[BlogService.update] Blog not found with id: ${id}`);
        throw new NotFoundException('Blog not found!');
      }
      console.log(`[BlogService.update] Blog found - id: ${blog.id}, title: ${blog.title}, owner: ${blog.user.id}`);

      if (blog.user.id != user.id) {
        console.log(`[BlogService.update] Authorization failed - blog owner: ${blog.user.id}, requesting user: ${user.id}`);
        throw new UnauthorizedException("This action is not allowed!");
      }
      console.log(`[BlogService.update] Authorization check passed - user owns the blog`);

      console.log(`[BlogService.update] Updating blog with id: ${id}`);

      // Handle tags update
      if (updateBlogDto.tagNames) {
        console.log(`[BlogService.update] Processing tags: ${updateBlogDto.tagNames}`);
        const tags = await Promise.all(
          updateBlogDto.tagNames.map(async (name) => {
            let tag = await this.tagRepo.findOne({ where: { name } });
            if (!tag) {
              console.log(`[BlogService.update] Creating new tag: ${name}`);
              tag = this.tagRepo.create({ name });
              await this.tagRepo.save(tag);
            }
            return tag;
          })
        );
        blog.tags = tags;
        console.log(`[BlogService.update] Tags updated successfully`);
      }

      // Handle related articles update
      if (updateBlogDto.relatedArticleIds !== undefined) {
        console.log(`[BlogService.update] Processing related articles: ${updateBlogDto.relatedArticleIds}`);

        if (updateBlogDto.relatedArticleIds.length > 0) {
          // Ensure the blog is not relating to itself
          const filteredIds = updateBlogDto.relatedArticleIds.filter(articleId => articleId !== id);

          if (filteredIds.length > 0) {
            const relatedArticles = await this.blogRepository.findByIds(filteredIds);

            // Validate that all related articles exist
            if (relatedArticles.length !== filteredIds.length) {
              const foundIds = relatedArticles.map(article => article.id);
              const missingIds = filteredIds.filter(id => !foundIds.includes(id));
              throw new NotFoundException(`Related articles not found with IDs: ${missingIds.join(', ')}`);
            }

            blog.relatedArticles = relatedArticles;
          } else {
            blog.relatedArticles = [];
          }
        } else {
          blog.relatedArticles = [];
        }
        console.log(`[BlogService.update] Related articles updated successfully`);
      }

      // Handle pages update
      if (updateBlogDto.pageIds !== undefined) {
        console.log(`[BlogService.update] Processing pages: ${updateBlogDto.pageIds}`);

        if (updateBlogDto.pageIds.length > 0) {
          const pages = await this.pageRepository.find({
            where: {
              id: In(updateBlogDto.pageIds)
            }
          });

          // Validate that all pages exist
          if (pages.length !== updateBlogDto.pageIds.length) {
            const foundIds = pages.map(page => page.id);
            const missingIds = updateBlogDto.pageIds.filter(id => !foundIds.includes(id));
            throw new NotFoundException(`Pages not found with IDs: ${missingIds.join(', ')}`);
          }

          blog.pages = pages;
        } else {
          blog.pages = [];
        }
        console.log(`[BlogService.update] Pages updated successfully`);
      }

      const { tagNames, relatedArticleIds, pageIds, ...updateData } = updateBlogDto;
      Object.assign(blog, updateData);

      const updatedBlog = await this.blogRepository.save(blog);
      console.log(`[BlogService.update] Blog update completed successfully`);

      return updatedBlog;
    } catch (error) {
      console.error(`[BlogService.update] Error occurred:`, error);
      console.error(`[BlogService.update] Error details - userId: ${userId}, blogId: ${id}`);
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: number, userId: string) {
    try {
      if (!await isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException('You Dont have permission to perform this action');
      }
      const blog = await this.blogRepository.findOne({
        where: {
          id
        }
      });

      if (!blog) {
        throw new NotFoundException('Blog not found!');
      }

      return await this.blogRepository.delete(id);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Page CRUD Methods
  async createPage(userId: string, createPageDto: CreatePageDto) {
    try {
      if (!await isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException('You dont have enough permission to do this');
      }
      // check if page name already exists
      const page = await this.pageRepository.findOne({
        where: { name: createPageDto.name }
      });
      if (page) {
        throw new BadRequestException('Page name already exists');
      }

      const newPage = this.pageRepository.create(createPageDto);
      return await this.pageRepository.save(newPage);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async findAllPages(filter: FilterPageDto) {
    try {
      const { page = 1, limit = 10, search } = filter;
      console.log({ filter });

      const query = this.pageRepository.createQueryBuilder('page')
        .skip((page - 1) * limit)
        .take(limit);

      if (search) {
        query.andWhere('(LOWER(page.name) LIKE LOWER(:search) OR LOWER(page.description) LIKE LOWER(:search))', { search: `%${search}%` });
      }


      const [pages, total] = await query.getManyAndCount();

      return {
        data: pages,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.log("error in findAllPages", error);
      throw error;
    }
  }

  async findOnePage(id: number) {
    try {
      const page = await this.pageRepository.findOne({
        where: { id }
      });

      if (!page) {
        throw new NotFoundException('Page not found');
      }

      return page;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updatePage(userId: string, id: number, updatePageDto: UpdatePageDto) {
    try {
      if (!await isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException('You dont have enough permission to do this');
      }

      const page = await this.pageRepository.findOne({
        where: { id }
      });

      if (!page) {
        throw new NotFoundException('Page not found');
      }

      Object.assign(page, updatePageDto);
      return await this.pageRepository.save(page);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async removePage(id: number, userId: string) {
    try {
      if (!await isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException('You dont have permission to perform this action');
      }

      const page = await this.pageRepository.findOne({
        where: { id }
      });

      if (!page) {
        throw new NotFoundException('Page not found');
      }

      return await this.pageRepository.delete(id);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}