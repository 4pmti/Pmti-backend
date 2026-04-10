
import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClassService } from './class.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';
import { FilterDto } from './dto/filter.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';



@ApiTags('Class')
@Controller('class')
export class ClassController {
  constructor(private readonly classService: ClassService) { }

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({ status: 201, description: 'Class created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  create(
    @Req() req: Request,
    @Body() createClassDto: CreateClassDto) {
    const userId = req.user?.id ?? '';
    return this.classService.create(userId, createClassDto);
  }


  @Get()
  @ApiOperation({ summary: 'List all classes with optional filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of classes' })
  findAll(
    @Query() filterDto: FilterDto
  ) {
    return this.classService.findAll(filterDto);
  }

  @UseGuards(AuthGuard)
  @Get('admin/all')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all classes for admin (includes inactive/cancelled)' })
  @ApiResponse({ status: 200, description: 'Paginated list of all classes for admin view' })
  findAllForAdmin(
    @Req() req: Request,
    @Query() filterDto: FilterDto
  ) {
   // const userId = req.user?.id ?? '';
    return this.classService.findAll(filterDto,true);
  }

  @Get(":id/detail")
  @ApiOperation({ summary: 'Get class details with enrollment information' })
  @ApiParam({ name: 'id', type: Number, description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class details with enrollments' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  findClassDetails(@Param('id') id: string) {
    return this.classService.findClassDetails(+id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a class by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class details' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  findOne(@Param('id') id: string) {
    return this.classService.findOne(+id);
  }


  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a class by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class updated successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  update(@Param('id') id: string, @Req() req: Request, @Body() updateClassDto: UpdateClassDto) {
    const userId = req.user?.id ?? '';
    return this.classService.update(+id, userId, updateClassDto);
  }

  @UseGuards(AuthGuard)
  @Delete('/bulk')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Bulk delete classes by IDs' })
  @ApiBody({ schema: { type: 'object', properties: { ids: { type: 'array', items: { type: 'number' }, example: [1, 2, 3] } } } })
  @ApiResponse({ status: 200, description: 'Classes deleted successfully' })
  async bulkDelete(@Body('ids') ids: number[], @Req() req: Request,) {
    const userId = req.user?.id ?? '';
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error('Invalid input: IDs should be a non-empty array.');
    }
    return this.classService.bulkDelete(userId, ids);
  }



  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a class by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Class deleted successfully' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  @ApiResponse({ status: 409, description: 'Class has active enrollments' })
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = req.user?.id ?? '';
    return this.classService.remove(+id, userId);
  }
}

@ApiTags('Category')
@ApiBearerAuth('JWT-auth')
@Controller('category')
@UseGuards(AuthGuard)
export class CategoryController {
  constructor(private readonly classService: ClassService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async createClass(@Body() createCategory: CreateCategoryDto) {
    return await this.classService.createCategory(createCategory);
  }

  @Get()
  @ApiOperation({ summary: 'List all categories' })
  @ApiResponse({ status: 200, description: 'List of all categories' })
  async getAllCategory() {
    return await this.classService.getAllCategory();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  async updateCategory(@Param('id') id: string, @Body() updateCategory: UpdateCategoryDto) {
    return await this.classService.updateCategory(+id, updateCategory);
  }

}


@ApiTags('ClassType')
@ApiBearerAuth('JWT-auth')
@Controller('classtype')
@UseGuards(AuthGuard)
export class ClassTypeController {
  constructor(private readonly classService: ClassService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new class type' })
  @ApiResponse({ status: 201, description: 'Class type created successfully' })
  async createType(@Body() createClassType: CreateCategoryDto) {
    return await this.classService.createClassType(createClassType);
  }

  @Get()
  @ApiOperation({ summary: 'List all class types' })
  @ApiResponse({ status: 200, description: 'List of all class types' })
  async getAllClassType() {
    return await this.classService.getAllClassType();
  }
}