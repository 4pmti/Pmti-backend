import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { FilterPageDto } from './dto/filter-page.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';
import { FilterBlogDto } from './dto/filter-blog.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) { }


  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Req() req: Request,
    @Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    const userId = req.user?.id ?? '';
    const blogId = parseInt(id, 10);
    if (isNaN(blogId)) {
      throw new BadRequestException('Invalid blog ID');
    }
    //console({userId});
    return this.blogService.update(userId, blogId, updateBlogDto);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Req() req: Request,
    @Body() createBlogDto: CreateBlogDto) {
    const userId = req.user?.id ?? '';
    return this.blogService.create(userId, createBlogDto);
  }



  @Get()
  findAll(@Query() filter: FilterBlogDto) {
    return this.blogService.findAll(filter);
  }

  // Page endpoints - Must come before @Get(':id') to avoid route conflicts
  @Post('pages')
  @UseGuards(AuthGuard)
  createPage(@Req() req: Request, @Body() createPageDto: CreatePageDto) {
    const userId = req.user?.id ?? '';
    return this.blogService.createPage(userId, createPageDto);
  }

  @Get('pages')
  findAllPages(@Query() filter: FilterPageDto) {
    return this.blogService.findAllPages(filter);
  }

  @Get('pages/:id')
  findOnePage(@Param('id') id: string) {
    const pageId = parseInt(id, 10);
    if (isNaN(pageId)) {
      throw new BadRequestException('Invalid page ID');
    }
    return this.blogService.findOnePage(pageId);
  }

  @Patch('pages/:id')
  @UseGuards(AuthGuard)
  updatePage(@Req() req: Request, @Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    const userId = req.user?.id ?? '';
    const pageId = parseInt(id, 10);
    if (isNaN(pageId)) {
      throw new BadRequestException('Invalid page ID');
    }
    return this.blogService.updatePage(userId, pageId, updatePageDto);
  }

  @Delete('pages/:id')
  @UseGuards(AuthGuard)
  removePage(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user?.id ?? '';
    const pageId = parseInt(id, 10);
    if (isNaN(pageId)) {
      throw new BadRequestException('Invalid page ID');
    }
    return this.blogService.removePage(pageId, userId);
  }

  // Blog-specific endpoints - Must come after page endpoints
  @Get(':id')
  findOne(@Param('id') id: string) {
    const blogId = parseInt(id, 10);
    if (isNaN(blogId)) {
      throw new BadRequestException('Invalid blog ID');
    }
    return this.blogService.findOne(blogId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user?.id ?? '';
    const blogId = parseInt(id, 10);
    if (isNaN(blogId)) {
      throw new BadRequestException('Invalid blog ID');
    }
    return this.blogService.remove(blogId, userId);
  }
}
