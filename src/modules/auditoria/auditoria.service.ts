import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { Auditoria } from './entities/auditoria.entity';
import { GetAuditoriaQueryDto } from './dto/get-auditoria-query.dto';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepository: Repository<Auditoria>,
  ) {}

  async create(createAuditoriaDto: CreateAuditoriaDto) {
    const auditoria = this.auditoriaRepository.create({
      ...createAuditoriaDto,
      actor: { id: createAuditoriaDto.actorId },
      filial: { id: createAuditoriaDto.filialId },
      accion: createAuditoriaDto.accion,
    });

    return this.auditoriaRepository.save(auditoria);
  }

  async findAll(query: GetAuditoriaQueryDto, filialId: number) {
    const { empleado, accion, desde, hasta } = query;

    const where: FindOptionsWhere<Auditoria> = {};

    if (empleado) {
      where.actor = { id: empleado };
    }

    if (accion) {
      where.accion = accion;
    }

    if (desde) {
      where.creadaEn = MoreThanOrEqual(desde);
    }

    if (hasta) {
      where.creadaEn = LessThanOrEqual(hasta);
    }

    where.filial = { id: filialId };

    return this.auditoriaRepository.find({ where });
  }
}
