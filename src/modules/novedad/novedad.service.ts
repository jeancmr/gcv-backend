import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { CreateNovedadDto } from './dto/create-novedad.dto';
import { GetNovedadesQueryDto } from './dto/get-novedades-query.dto';
import { Novedad } from './entities/novedad.entity';
import { NovedadEstado } from './enums/novedad-estado.enum';
import { UsuarioRol } from '../usuarios/enums/usuario-rol.enum';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class NovedadService {
  constructor(
    @InjectRepository(Novedad)
    private readonly novedadRepository: Repository<Novedad>,
  ) {}

  async create(createNovedadDto: CreateNovedadDto, user: JwtPayload) {
    const novedad = this.novedadRepository.create({
      ...createNovedadDto,
      filial: { id: user.filialId },
      solicitante: { id: user.sub },
    });

    const savedNovedad = await this.novedadRepository.save(novedad);

    return savedNovedad;
  }

  async findAll(query: GetNovedadesQueryDto, user: JwtPayload) {
    const { tipo, estado, desde, hasta } = query;

    const where: FindOptionsWhere<Novedad> = {};

    if (tipo) where.tipo = tipo;

    if (desde && hasta) {
      where.creadaEn = Between(desde, hasta);
    } else if (desde) {
      where.creadaEn = MoreThanOrEqual(desde);
    } else if (hasta) {
      where.creadaEn = LessThanOrEqual(hasta);
    }

    if (user.rol === UsuarioRol.SUPERVISOR || user.rol === UsuarioRol.RRHH) {
      if (estado === NovedadEstado.BORRADOR) {
        throw new UnauthorizedException(
          `No tiene autorización para ver novedades en estado BORRADOR`,
        );
      }

      //Trae todas las novedades que no estén en estado BORRADORs si no se especifica estado
      where.estado = estado ? estado : Not(NovedadEstado.BORRADOR);
    }

    if (user.rol === UsuarioRol.COLABORADOR) {
      if (estado) where.estado = estado;
      where.solicitante = { id: user.sub };
    }

    where.filial = { id: user.filialId };

    return await this.novedadRepository.find({
      where,
      order: {
        id: 'DESC',
      },
    });
  }

  async findOneById(id: number, filialId: number) {
    const novedad = await this.novedadRepository.findOne({
      where: { id, filial: { id: filialId } },
    });

    if (!novedad) {
      throw new NotFoundException(`Novedad no encontrada`);
    }

    return novedad;
  }

  async postRequest(id: number, user: JwtPayload) {
    const novedad = await this.novedadRepository.findOne({
      where: {
        id,
        filial: { id: user.filialId },
        solicitante: { id: user.sub },
      },
    });

    if (!novedad) {
      throw new NotFoundException(`Novedad no encontrada`);
    }

    if (novedad.estado !== NovedadEstado.BORRADOR) {
      throw new BadRequestException(
        'La novedad ya ha sido procesada y no puede ser enviada nuevamente',
      );
    }

    await this.novedadRepository.update(id, {
      estado: NovedadEstado.PENDIENTE,
    });

    return { message: 'Novedad enviada para aprobación' };
  }

  async aproveRequest(id: number, user: JwtPayload) {
    const novedadFound = await this.findOneById(id, user.filialId);

    if (novedadFound.estado === NovedadEstado.BORRADOR)
      throw new BadRequestException(
        'La novedad no ha sido enviada para aprobación y no puede ser aprobada',
      );

    if (novedadFound.estado !== NovedadEstado.PENDIENTE) {
      throw new BadRequestException('La novedad ya ha sido procesada');
    }

    await this.novedadRepository.update(id, {
      estado: NovedadEstado.APROBADA,
      aprobador: { id: user.sub },
    });

    return { message: 'Novedad aprobada' };
  }

  async denyRequest(id: number, user: JwtPayload) {
    const novedadFound = await this.findOneById(id, user.filialId);

    if (novedadFound.estado === NovedadEstado.BORRADOR)
      throw new BadRequestException(
        'La novedad no ha sido enviada para aprobación y no puede ser rechazada',
      );

    if (novedadFound.estado !== NovedadEstado.PENDIENTE) {
      throw new BadRequestException('La novedad ya ha sido procesada');
    }

    await this.novedadRepository.update(id, {
      estado: NovedadEstado.RECHAZADA,
    });

    return { message: 'Novedad rechazada' };
  }

  async aproveRequestMassive(ids: number[], user: JwtPayload) {
    const novedades = await this.novedadRepository.find({
      where: {
        id: In(ids),
        filial: { id: user.filialId },
        estado: NovedadEstado.PENDIENTE,
      },
    });

    if (novedades.length !== ids.length) {
      throw new NotFoundException('Una o más novedades no existen');
    }

    await this.novedadRepository.update(
      {
        id: In(ids),
      },
      {
        estado: NovedadEstado.APROBADA,
        aprobador: {
          id: user.sub,
        },
      },
    );

    return { message: 'Novedades aprobadas masivamente' };
  }
}
