import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { BulkUpdateEnrollmentDto, UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { RescheduleDto } from './dto/reschedule.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';
import { OfflineClassEnrollmentDto } from './dto/class-offline-enrollment.dto';
import { OfflineCourseEnrollmentDto } from './dto/course-offline-enrollment.dto';

@ApiTags('Enrollment')
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) { }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create an online enrollment (public)', description: 'Self-service enrollment with payment processing. Student info and billing details are collected and payment is charged via Authorize.Net.' })
  @ApiResponse({ status: 201, description: 'Enrollment created and payment processed' })
  @ApiResponse({ status: 400, description: 'Validation error or payment failure' })
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentService.create(createEnrollmentDto);
  }

  @UseGuards(AuthGuard)
  @Post('/course')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create an offline enrollment for a course (admin)', description: 'Admin-initiated enrollment for an online course. Supports purchase orders and manual payment tracking.' })
  @ApiResponse({ status: 201, description: 'Offline course enrollment created' })
  createOfflineEnrollmentForCourse(
    @Req() req: Request,
    @Body() offlineCourseDto: OfflineCourseEnrollmentDto
  ){
    const userId = req.user.id;
    return this.enrollmentService.createOfflineCourseEnrollment(userId,offlineCourseDto);
  }

  @UseGuards(AuthGuard)
  @Post('/class')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create an offline enrollment for a class (admin)', description: 'Admin-initiated enrollment for a scheduled class. Supports purchase orders and manual payment tracking.' })
  @ApiResponse({ status: 201, description: 'Offline class enrollment created' })
  createOfflineEnrollmentForClass(
    @Req() req: Request,
    @Body() offlineClassDto: OfflineClassEnrollmentDto
  ){
    const userId = req.user.id;
    return this.enrollmentService.createOfflineClassEnrollment(userId,offlineClassDto);

  }



  @UseGuards(AuthGuard)
  @Post('/reschedule')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reschedule a student enrollment to a different class', description: 'Moves a student from one class to another. May require additional payment if pricing differs.' })
  @ApiResponse({ status: 201, description: 'Enrollment rescheduled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid reschedule request' })
  reschedule(
    @Req() req: Request,
    @Body() rescheduleDto: RescheduleDto) {
    const userId = req.user.id;
    return this.enrollmentService.rescheduleClass(
      userId,
      rescheduleDto
    )
  }

  @Get()
  @ApiOperation({ summary: 'List all enrollments' })
  @ApiResponse({ status: 200, description: 'List of all enrollments' })
  findAll() {
    return this.enrollmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an enrollment by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Enrollment ID' })
  @ApiResponse({ status: 200, description: 'Enrollment details' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  findOne(@Param('id') id: string) {
    return this.enrollmentService.findOne(+id);
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Bulk update enrollments' })
  @ApiResponse({ status: 200, description: 'Enrollments updated successfully' })
  bulkUpdate(@Body() bulkUpdateEnrollmentDto: BulkUpdateEnrollmentDto) {
    return this.enrollmentService.bulkUpdate(bulkUpdateEnrollmentDto);
  }


  @Patch(':id')
  @ApiOperation({ summary: 'Update an enrollment by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Enrollment ID' })
  @ApiResponse({ status: 200, description: 'Enrollment updated successfully' })
  update(@Param('id') id: string, @Body() updateEnrollmentDto: UpdateEnrollmentDto) {
    return this.enrollmentService.update(+id, updateEnrollmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an enrollment by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Enrollment ID' })
  @ApiResponse({ status: 200, description: 'Enrollment deleted successfully' })
  remove(@Param('id') id: string) {
    return this.enrollmentService.remove(+id);
  }
}
