import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guard/auth.guard';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(AuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all admin users' })
  @ApiResponse({ status: 200, description: 'List of all admins' })
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an admin by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Admin ID' })
  @ApiResponse({ status: 200, description: 'Admin details' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an admin by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Admin ID' })
  @ApiResponse({ status: 200, description: 'Admin updated successfully' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  update(@Param('id') id: string,  @Req() req: Request,@Body() updateAdminDto: UpdateAdminDto) {
    const userId = req.user?.id??'';
    return this.adminService.update(+id, userId,updateAdminDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an admin by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Admin ID' })
  @ApiResponse({ status: 200, description: 'Admin deleted successfully' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
