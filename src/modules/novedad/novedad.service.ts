import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  EntityManager,
  FindOptionsWhere,
  ILike,
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
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AuditoriaAccion } from '../auditoria/enums/auditoria-accion.enum';

@Injectable()
export class NovedadService {
  constructor(
    @InjectRepository(Novedad)
    private readonly novedadRepository: Repository<Novedad>,
    private readonly auditoriaService: AuditoriaService,
    private readonly dataSource: DataSource,
  ) {}
  private readonly ENTIDAD = 'Novedad';

  async create(createNovedadDto: CreateNovedadDto, user: JwtPayload) {
    return this.dataSource.transaction(async (manager) => {
      const novedadRepository = manager.getRepository(Novedad);

      const novedad = novedadRepository.create({
        ...createNovedadDto,
        filial: { id: user.filialId },
        solicitante: { id: user.sub },
      });

      const savedNovedad = await novedadRepository.save(novedad);

      await this.auditoriaService.create(
        {
          accion: AuditoriaAccion.CREAR,
          actorId: user.sub,
          entidad: this.ENTIDAD,
          entidadId: savedNovedad.id.toString(),
          filialId: user.filialId,
        },
        manager,
      );

      return savedNovedad;
    });
  }

  async findAll(query: GetNovedadesQueryDto, user: JwtPayload) {
    const { tipo, estado, desde, hasta, search } = query;

    const where: FindOptionsWhere<Novedad> = {};

    if (tipo) where.tipo = tipo;

    if (search) {
      if (user.rol === UsuarioRol.COLABORADOR) {
        where.descripcion = ILike(`%${search}%`);
      } else {
        where.solicitante = { nombre: ILike(`%${search}%`) };
      }
    }

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
      relations: {
        solicitante: true,
      },
      select: {
        id: true,
        tipo: true,
        estado: true,
        fechaInicio: true,
        fechaFin: true,
        descripcion: true,
        creadaEn: true,
        actualizadaEn: true,
        solicitante: {
          id: true,
          nombre: true,
          rol: true,
        },
      },
      order: {
        id: 'DESC',
      },
    });
  }

  async findOneById(id: number, filialId: number, manager: EntityManager) {
    const repository = manager.getRepository(Novedad);

    const novedad = await repository.findOne({
      where: {
        id,
        filial: { id: filialId },
      },
    });

    if (!novedad) {
      throw new NotFoundException('Novedad no encontrada');
    }

    return novedad;
  }

  async postRequest(id: number, user: JwtPayload) {
    return this.dataSource.transaction(async (manager) => {
      const novedadRepository = manager.getRepository(Novedad);

      const novedad = await novedadRepository.findOne({
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

      await novedadRepository.update(id, {
        estado: NovedadEstado.PENDIENTE,
      });

      await this.auditoriaService.create(
        {
          accion: AuditoriaAccion.ENVIAR,
          actorId: user.sub,
          entidad: this.ENTIDAD,
          entidadId: novedad.id.toString(),
          filialId: user.filialId,
        },
        manager,
      );

      return { message: 'Novedad enviada para aprobación' };
    });
  }

  async aproveRequest(id: number, user: JwtPayload) {
    return this.dataSource.transaction(async (manager) => {
      const novedadRepository = manager.getRepository(Novedad);

      const novedadFound = await this.findOneById(id, user.filialId, manager);

      if (novedadFound.estado === NovedadEstado.BORRADOR)
        throw new BadRequestException(
          'La novedad no ha sido enviada para aprobación y no puede ser aprobada',
        );

      if (novedadFound.estado !== NovedadEstado.PENDIENTE) {
        throw new BadRequestException('La novedad ya ha sido procesada');
      }

      await novedadRepository.update(id, {
        estado: NovedadEstado.APROBADA,
        aprobador: { id: user.sub },
      });

      await this.auditoriaService.create(
        {
          accion: AuditoriaAccion.APROBAR,
          actorId: user.sub,
          entidad: this.ENTIDAD,
          entidadId: novedadFound.id.toString(),
          filialId: user.filialId,
        },
        manager,
      );

      return { message: 'Novedad aprobada' };
    });
  }

  async denyRequest(id: number, user: JwtPayload) {
    return this.dataSource.transaction(async (manager) => {
      const novedadRepository = manager.getRepository(Novedad);

      const novedadFound = await this.findOneById(id, user.filialId, manager);

      if (novedadFound.estado === NovedadEstado.BORRADOR)
        throw new BadRequestException(
          'La novedad no ha sido enviada para aprobación y no puede ser rechazada',
        );

      if (novedadFound.estado !== NovedadEstado.PENDIENTE) {
        throw new BadRequestException('La novedad ya ha sido procesada');
      }

      await novedadRepository.update(id, {
        estado: NovedadEstado.RECHAZADA,
      });

      await this.auditoriaService.create(
        {
          accion: AuditoriaAccion.RECHAZAR,
          actorId: user.sub,
          entidad: this.ENTIDAD,
          entidadId: novedadFound.id.toString(),
          filialId: user.filialId,
        },
        manager,
      );

      return { message: 'Novedad rechazada' };
    });
  }

  async aproveRequestMassive(ids: number[], user: JwtPayload) {
    return this.dataSource.transaction(async (manager) => {
      const novedadRepository = manager.getRepository(Novedad);

      const novedades = await novedadRepository.find({
        where: {
          id: In(ids),
          filial: { id: user.filialId },
          estado: NovedadEstado.PENDIENTE,
        },
      });

      if (novedades.length !== ids.length) {
        throw new NotFoundException('Una o más novedades no existen');
      }

      await novedadRepository.update(
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

      for (const id of ids) {
        await this.auditoriaService.create(
          {
            accion: AuditoriaAccion.APROBAR,
            actorId: user.sub,
            entidad: this.ENTIDAD,
            entidadId: id.toString(),
            detalle: {
              message: 'Aprobado de forma masiva',
            },
            filialId: user.filialId,
          },
          manager,
        );
      }

      return { message: 'Novedades aprobadas masivamente' };
    });
  }
}
