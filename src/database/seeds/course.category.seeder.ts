import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/class/entities/category.entity';
import { Repository } from 'typeorm';


@Injectable()
export class CategorySeeder {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async seed() {
    const categories = [
      { name: 'CAPM', description: null },
      { name: 'Management', description: 'By Viscus' },
      { name: 'MSPS', description: 'MS Project Server Courses' },
      { name: 'mspsadmin', description: '2 Day MS PS for Admins' },
      { name: 'mspsexec', description: '2 Day MS PS for Executives' },
      { name: 'mspspm', description: '2 Day MS PS for PMs and HRMs' },
      { name: 'OPM3', description: 'These are OPM3 classes' },
      { name: 'PDU', description: 'These are PDU Courses they can be online or class room' },
      { name: 'PM Fundamentals', description: 'PM Fundamentals' },
      { name: 'PMI-ACP', description: 'ACP' },
      { name: 'PMP', description: 'This is a PMP CAPM Prep course' },
      { name: 'PMP EL reexam fee', description: 'PMP EL with re-exam fee guarantee' },
      { name: 'PMP Instructor led', description: 'PMP instructor led course.' },
      { name: 'RMP', description: 'Risk Management Professional' },
      { name: 'Strategic Management', description: 'Tested by Viscus' },
    ];

    for (const category of categories) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: category.name },
      });

      if (!existingCategory) {
        await this.categoryRepository.save(this.categoryRepository.create(category));
        //console(`Category "${category.name}" inserted.`);
      } else {
        //console(`Category "${category.name}" already exists.`);
      }
    }
  }
}
