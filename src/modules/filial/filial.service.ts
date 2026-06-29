import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Filial } from './entities/filial.entity';
import { CreateFilialDto } from './dto/create-filial.dto';

@Injectable()
export class FilialService {
  constructor(
    @InjectRepository(Filial)
    private readonly filialRepository: Repository<Filial>,
  ) {}

  async create(createFilialDto: CreateFilialDto) {
    const newFilial = this.filialRepository.create(createFilialDto);
    await this.filialRepository.save(newFilial);

    return {
      message: 'Filial creada exitosamente',
      filial: newFilial,
    };
  }

  async findOneById(id: number) {
    const filial = await this.filialRepository.findOneBy({ id });
    return filial;
  }
}
