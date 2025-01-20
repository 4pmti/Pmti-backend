import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { BulkUpdateEnrollmentDto, UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { RescheduleDto } from './dto/reschedule.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Request } from 'express';
import { OfflineClassEnrollmentDto } from './dto/class-offline-enrollment.dto';

@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) { }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentService.create(createEnrollmentDto);
  }

  @UseGuards(AuthGuard)
  @Post('/course')
 // @UsePipes(new ValidationPipe({ transform: true }))
  createOfflineEnrollmentForCourse(
    @Req() req: Request,
    @Body() rescheduleDto: CreateEnrollmentDto
  ){
    const userId = req.user.id;

  }

  @UseGuards(AuthGuard)
  @Post('/class')
  //@UsePipes(new ValidationPipe({ transform: true }))
  createOfflineEnrollmentForClass(
    @Req() req: Request,
    @Body() offlineClassDto: OfflineClassEnrollmentDto
  ){
    const userId = req.user.id;
    return this.enrollmentService.createOfflineClassEnrollment(userId,offlineClassDto);

  }



  @UseGuards(AuthGuard)
  @Post('/reschedule')
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
  findAll() {
    return this.enrollmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enrollmentService.findOne(+id);
  }

  @Patch('bulk')
  bulkUpdate(@Body() bulkUpdateEnrollmentDto: BulkUpdateEnrollmentDto) {
    return this.enrollmentService.bulkUpdate(bulkUpdateEnrollmentDto);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEnrollmentDto: UpdateEnrollmentDto) {
    return this.enrollmentService.update(+id, updateEnrollmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enrollmentService.remove(+id);
  }
}
