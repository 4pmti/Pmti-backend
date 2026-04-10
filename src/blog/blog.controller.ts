import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { FilterPageDto } from './dto/filter-page.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';
import { FilterBlogDto } from './dto/filter-blog.dto';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) { }


  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a blog post' })
  @ApiParam({ name: 'id', type: Number, description: 'Blog ID' })
  @ApiResponse({ status: 200, description: 'Blog updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid blog ID' })
  @ApiResponse({ status: 404, description: 'Blog not found' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiResponse({ status: 201, description: 'Blog created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(
    @Req() req: Request,
    @Body() createBlogDto: CreateBlogDto) {
    const userId = req.user?.id ?? '';
    return this.blogService.create(userId, createBlogDto);
  }



  @Get()
  @ApiOperation({ summary: 'List all blog posts with optional filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of blog posts' })
  findAll(@Query() filter: FilterBlogDto) {
    return this.blogService.findAll(filter);
  }

  // Page endpoints - Must come before @Get(':id') to avoid route conflicts
  @Post('pages')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new page' })
  @ApiResponse({ status: 201, description: 'Page created successfully' })
  createPage(@Req() req: Request, @Body() createPageDto: CreatePageDto) {
    const userId = req.user?.id ?? '';
    return this.blogService.createPage(userId, createPageDto);
  }

  @Get('pages')
  @ApiOperation({ summary: 'List all pages with optional filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of pages' })
  findAllPages(@Query() filter: FilterPageDto) {
    return this.blogService.findAllPages(filter);
  }

  @Get('pages/:id')
  @ApiOperation({ summary: 'Get a page by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Page ID' })
  @ApiResponse({ status: 200, description: 'Page details' })
  @ApiResponse({ status: 400, description: 'Invalid page ID' })
  findOnePage(@Param('id') id: string) {
    const pageId = parseInt(id, 10);
    if (isNaN(pageId)) {
      throw new BadRequestException('Invalid page ID');
    }
    return this.blogService.findOnePage(pageId);
  }

  @Patch('pages/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a page' })
  @ApiParam({ name: 'id', type: Number, description: 'Page ID' })
  @ApiResponse({ status: 200, description: 'Page updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid page ID' })
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a page' })
  @ApiParam({ name: 'id', type: Number, description: 'Page ID' })
  @ApiResponse({ status: 200, description: 'Page deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid page ID' })
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
  @ApiOperation({ summary: 'Get a blog post by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Blog ID' })
  @ApiResponse({ status: 200, description: 'Blog post details' })
  @ApiResponse({ status: 400, description: 'Invalid blog ID' })
  findOne(@Param('id') id: string) {
    const blogId = parseInt(id, 10);
    if (isNaN(blogId)) {
      throw new BadRequestException('Invalid blog ID');
    }
    return this.blogService.findOne(blogId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a blog post' })
  @ApiParam({ name: 'id', type: Number, description: 'Blog ID' })
  @ApiResponse({ status: 200, description: 'Blog deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid blog ID' })
  remove(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user?.id ?? '';
    const blogId = parseInt(id, 10);
    if (isNaN(blogId)) {
      throw new BadRequestException('Invalid blog ID');
    }
    return this.blogService.remove(blogId, userId);
  }
}
