import { Test, TestingModule } from '@nestjs/testing';
import { CourseEnrollmentsService } from './course-enrollments.service';

describe('CourseEnrollmentsService', () => {
  let service: CourseEnrollmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CourseEnrollmentsService],
    }).compile();

    service = module.get<CourseEnrollmentsService>(CourseEnrollmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
