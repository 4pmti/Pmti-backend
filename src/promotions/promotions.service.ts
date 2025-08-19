import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { In, Repository } from 'typeorm';
import { Country } from 'src/country/entities/country.entity';
import { Instructor } from 'src/instructor/entities/instructor.entity';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/class/entities/category.entity';
import { ClassType } from 'src/class/entities/classtype.entity';
import { Promotions } from './entities/promotion.entity';
import { isAdmin } from 'src/common/util/utilities';
import { FindPromotionsDto } from './dto/find-promotions.dto';


@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    @InjectRepository(Promotions)
    private readonly promoRepository: Repository<Promotions>,

    @InjectRepository(ClassType)
    private readonly classTypeRepository: Repository<ClassType>
  ) { }


  async create(userId: string, createPromotionDto: CreatePromotionDto) {
    try {

      const country = await this.countryRepository.findOne({
        where: {
          id: createPromotionDto.countryId
        }
      });
      if (!country) {
        throw new NotFoundException("Country Not Found");
      }
      const category = await this.categoryRepository.findOne({
        where: {
          id: createPromotionDto.categoryId
        }
      });
      if (!category) {
        throw new NotFoundException("Category Not Found");
      }

      const classType = await this.classTypeRepository.findOne({
        where: {
          id: createPromotionDto.classTypeId
        }
      });

      if (!classType) {
        throw new NotFoundException("ClassType Not Found");
      }

      const user = await this.userRepository.findOne({
        where: {
          id: userId
        }
      });

      if (!user) {
        throw new NotFoundException("User Not Found");
      }

      if (!await isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException("You Dont Have permission to perform this action");
      }
      //console(createPromotionDto);

      const checkPromotion = await this.promoRepository.findOne({
        where: {
          promotionId: createPromotionDto.promotionId
        }
      });

      if (checkPromotion) {
        throw new BadRequestException("Promotion ID Already Exists");
      }
      const promotion = new Promotions();
      promotion.active = createPromotionDto.active;
      promotion.addedBy = user;
      promotion.updatedBy = user;
      promotion.attachedFilePath = createPromotionDto.attachedFilePath;
      promotion.category = category;
      promotion.classType = classType;
      promotion.country = country;
      promotion.amount = createPromotionDto.amount;
      promotion.description = createPromotionDto.description;
      promotion.endDate = createPromotionDto.endDate;
      promotion.startDate = createPromotionDto.startDate;
      promotion.isDelete = createPromotionDto.isDelete;
      promotion.promotionId = createPromotionDto.promotionId;
      promotion.promotionType = createPromotionDto.promotionType;
      promotion.title = createPromotionDto.title;

      return await this.promoRepository.save(promotion);

    } catch (error) {
      //console(error);
      throw new InternalServerErrorException("Something went wrong.," + error);
    }
  }

  async findAll(filters: FindPromotionsDto) {
    try {

      if (filters.countryId && !(await this.countryRepository.findOne({ where: { id: filters.countryId } }))) {
        throw new BadRequestException('Invalid countryId provided');
      }
      const queryBuilder = this.promoRepository.createQueryBuilder('promotions')
        .leftJoinAndSelect('promotions.country', 'country')
        .leftJoinAndSelect("promotions.category", "category")
        .leftJoinAndSelect("promotions.classType", "classType");

      if (filters.id) {
        queryBuilder.andWhere('promotions.promotionId LIKE :id', { id: `%${filters.id}%` });
      }

      if (filters.amount) {
        if (filters.amount.lt) {
          queryBuilder.andWhere('promotions.amount < :lt', { lt: filters.amount.lt });
        }
        if (filters.amount.gt) {
          queryBuilder.andWhere('promotions.amount > :gt', { gt: filters.amount.gt });
        }
        if (filters.amount.eq !== undefined) {
          queryBuilder.andWhere('promotions.amount = :eq', { eq: filters.amount.eq });
        }
      }

      if (filters.countryId) {
        queryBuilder.andWhere('promotions.country LIKE :country', { country: `%${filters.countryId}%` });
      }

      if (filters.startDateFrom) {
        queryBuilder.andWhere('promotions.startDate >= :startDateFrom', { startDateFrom: filters.startDateFrom });
      }

      if (filters.endDateTo) {
        queryBuilder.andWhere('promotions.endDate <= :endDateTo', { endDateTo: filters.endDateTo });
      }

      return queryBuilder.getMany();
    } catch (error) {
      //console(error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {

      const promo = await this.promoRepository.findOne(
        {
          where: {
            id: id
          }
        }
      );

      if (!promo) {
        throw new NotFoundException("Promo Not Found");
      }
      return promo;

    } catch (error) {
      //console(error);
      throw error;
    }
  }


  async update(id: number, userId: string, updatePromotionDto: UpdatePromotionDto) {
    try {

      const user = await this.userRepository.findOne({
        where: {
          id: userId
        }
      });
      if (!user) {
        throw new NotFoundException("User Not Found");
      }

      if (!await isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException("You Dont have the permission to do this action");
      }

      // 1. Find the promotion by ID
      const promotion = await this.promoRepository
        .findOne({ where: { id }, relations: ['country', 'category', 'classType', 'addedBy', 'updatedBy'] });

      if (!promotion) {
        throw new NotFoundException(`Promotion with id ${id} not found`);
      }

      // 2. Validate if the user has permission to update the promotion
      if (promotion.addedBy.id !== userId) {
        throw new BadRequestException('You are not authorized to update this promotion');
      }

      // 3. Validate the provided countryId if present
      if (updatePromotionDto.countryId) {
        const countryExists = await this.countryRepository.findOne({ where: { id: updatePromotionDto.countryId } });
        if (!countryExists) {
          throw new BadRequestException('Invalid countryId provided');
        }
      }

      // 4. Validate the other fields (e.g., check for amount and dates)
      if (updatePromotionDto.amount && updatePromotionDto.amount <= 0) {
        throw new BadRequestException('Amount should be greater than 0');
      }

      if (updatePromotionDto.startDate && updatePromotionDto.endDate && updatePromotionDto.startDate > updatePromotionDto.endDate) {
        throw new BadRequestException('Start date cannot be after the end date');
      }

      // 5. Use Object.assign to update promotion fields
      Object.assign(promotion, updatePromotionDto);

      // 6. Optionally update the 'updatedBy' field to the current user
      promotion.updatedBy = user; // Assuming you have a User entity

      // 7. Save the updated promotion
      return await this.promoRepository.save(promotion);
    } catch (error) {
      //console(error);
      throw error;
    }
  }

  async remove(userId: string, id: number) {
    try {

      const user = await this.userRepository.findOne({
        where: {
          id: userId
        }
      });
      if (!user) {
        throw new NotFoundException("User Not Found");
      }

      if (!await isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException("You Dont have the permission to do this action");
      }

      const promo = await this.promoRepository.findOne({
        where: { id }
      });

      if (!promo) {
        throw new NotFoundException("Promo Not Found");
      }
      return await this.promoRepository.remove(promo);
    } catch (error) {
      //console(error);
      throw error;
    }
  }


  async bulkRemove(userId: string, ids: number[]) {
    try {

      const user = await this.userRepository.findOne({
        where: {
          id: userId
        }
      });
      if (!user) {
        throw new NotFoundException("User Not Found");
      }

      if (!await isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException("You Dont have the permission to do this action");
      }

      const promotions = await this.promoRepository.findBy({ id: In(ids) });
      if (promotions.length !== ids.length) {
        throw new NotFoundException('Some promotions were not found');
      }
      await this.promoRepository.remove(promotions);
    } catch (error) {
      //console(error);
      throw error;
    }
  }
}
