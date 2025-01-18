import { HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { State } from './entities/state.entity';
import { User } from 'src/user/entities/user.entity';
import { isAdmin } from 'src/common/util/utilities';
import { Country } from 'src/country/entities/country.entity';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { StateFilterDto } from './dto/state-filter.dto';

@Injectable()
export class StateService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>
  ) { }


  async create(userId: string, createStateDto: CreateStateDto) {
    try {
      if (!isAdmin(userId, this.userRepository)) {
        throw new UnauthorizedException("You dont have permission to perform this.");
      }
      const country = await this.countryRepository.findOne({
        where: { id: createStateDto.countryId }
      });
      if (!country) {
        throw new NotFoundException('Country not found');
      }
      const state = new State();
      state.country = country;
      state.name = createStateDto.name;
      await this.stateRepository.save(state);
      return state;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(filterDto: StateFilterDto): Promise<State[]> {
    const { countryId, stateId } = filterDto;

    const query = this.stateRepository
      .createQueryBuilder('state')
      .leftJoinAndSelect('state.locations', 'location')
      .leftJoinAndSelect('state.country', 'country');

    if (countryId) {
      query.andWhere('state.country_id = :countryId', { countryId });
    }

    if (stateId) {
      query.andWhere('state.id = :stateId', { stateId });
    }

    return await query.getMany();
  }

  async findOne(id: number) {
    try {
      const state = await this.stateRepository.findOne({
        where: { id },
        relations :{
          country:true
        }
      });

      if (!state) {
        throw new NotFoundException("State not found");
      }
      return state;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: number, userId: string, updateStateDto: UpdateStateDto) {
    try {

      if (!(await isAdmin(userId, this.userRepository))) {
        throw new UnauthorizedException("You don't have permission to perform this.");
      }

      const state = await this.stateRepository.findOne({ where: { id } });
      if (!state) {
        throw new NotFoundException("State not found");
      }

      let country: Country | undefined;
      if (updateStateDto.countryId) {
        country = await this.countryRepository.findOne({
          where: { id: updateStateDto.countryId },
        });
        if (!country) {
          throw new NotFoundException('Country not found');
        }
      }
      Object.assign(state, {
        ...updateStateDto,
        country: country || state.country,
      });

      // Save the updated state
      return await this.stateRepository.save(state);
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error updating state:', error);

      throw error;
    }
  }


  async remove(userId:string,id: number) {
    if (!isAdmin(userId, this.userRepository)) {
      throw new UnauthorizedException("You dont have permission to perform this.");
    }

    const state = await this.stateRepository.findOne({
      where: { id },
    });

    if (!state) {
      throw new NotFoundException("State not found");
    }

    return await this.stateRepository.delete({
      id: id
    })
  }
}
