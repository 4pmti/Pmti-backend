import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';
import { FilterBlogDto } from './dto/filter-blog.dto';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) { }

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(+id, updateBlogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogService.remove(+id);
  }
}
