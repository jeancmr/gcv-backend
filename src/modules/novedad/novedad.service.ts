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
import { UpdateNovedadDto } from './dto/update-novedad.dto';
import {
  ExportNovedadesQueryDto,
  NovedadExportFormat,
} from './dto/export-novedades-query.dto';

@Injectable()
export class NovedadService {
  constructor(
    @InjectRepository(Novedad)
    private readonly novedadRepository: Repository<Novedad>,
    private readonly auditoriaService: AuditoriaService,
    private readonly dataSource: DataSource,
  ) {}
  private readonly ENTIDAD = 'Novedad';

  private readonly EXPORT_HEADER =
    'filial_codigo;documento_solicitante;tipo_novedad;fecha_inicio;fecha_fin;estado;aprobado_por;fecha_aprobacion';

  private toIsoDate(value: Date) {
    return value.toISOString().slice(0, 10);
  }

  private escapeCsvValue(value: string) {
    if (
      value.includes(';') ||
      value.includes('"') ||
      value.includes('\n') ||
      value.includes('\r')
    ) {
      const escaped = value.replace(/"/g, '""');
      return `"${escaped}"`;
    }

    return value;
  }

  private buildBaseWhere(user: JwtPayload) {
    const where: FindOptionsWhere<Novedad> = {
      filial: { id: user.filialId },
    };

    if (user.rol === UsuarioRol.SUPERVISOR || user.rol === UsuarioRol.RRHH) {
      where.estado = Not(NovedadEstado.BORRADOR);
    }

    if (user.rol === UsuarioRol.COLABORADOR) {
      where.solicitante = { id: user.sub };
    }

    return where;
  }

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

  async update(
    id: number,
    updateNovedadDto: UpdateNovedadDto,
    user: JwtPayload,
  ) {
    const novedadFound = await this.novedadRepository.findOne({
      where: {
        id,
        filial: { id: user.filialId },
        solicitante: { id: user.sub },
      },
    });

    if (!novedadFound) {
      throw new NotFoundException(`Novedad no encontrada`);
    }

    await this.novedadRepository.update(id, {
      ...updateNovedadDto,
    });

    const updatedNovedad = await this.novedadRepository.findOne({
      where: { id },
    });

    return updatedNovedad;
  }

  async findAll(query: GetNovedadesQueryDto, user: JwtPayload) {
    const { tipo, estado, desde, hasta, search } = query;

    const where: FindOptionsWhere<Novedad> = this.buildBaseWhere(user);

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

      // Trae todas las novedades que no estén en estado BORRADOR si no se especifica estado
      where.estado = estado ? estado : Not(NovedadEstado.BORRADOR);
    }

    if (user.rol === UsuarioRol.COLABORADOR) {
      if (estado) where.estado = estado;
    }

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

  async findAllStats(user: JwtPayload) {
    const baseWhere = this.buildBaseWhere(user);

    const [total, pendientes, aprobadas, rechazadas, borradores] =
      await Promise.all([
        this.novedadRepository.count({ where: baseWhere }),
        this.novedadRepository.count({
          where: { ...baseWhere, estado: NovedadEstado.PENDIENTE },
        }),
        this.novedadRepository.count({
          where: { ...baseWhere, estado: NovedadEstado.APROBADA },
        }),
        this.novedadRepository.count({
          where: { ...baseWhere, estado: NovedadEstado.RECHAZADA },
        }),
        this.novedadRepository.count({
          where: { ...baseWhere, estado: NovedadEstado.BORRADOR },
        }),
      ]);

    return {
      total,
      pendientes,
      aprobadas,
      rechazadas,
      borradores,
    };
  }

  async exportApproved(query: ExportNovedadesQueryDto, user: JwtPayload) {
    if (user.rol !== UsuarioRol.RRHH) {
      throw new UnauthorizedException(
        'No tiene autorización para exportar novedades aprobadas',
      );
    }

    const novedades = await this.novedadRepository.find({
      where: {
        filial: { id: user.filialId },
        estado: NovedadEstado.APROBADA,
      },
      relations: {
        filial: true,
        solicitante: true,
        aprobador: true,
      },
      select: {
        tipo: true,
        estado: true,
        fechaInicio: true,
        fechaFin: true,
        actualizadaEn: true,
        filial: {
          codigo: true,
        },
        solicitante: {
          email: true,
        },
        aprobador: {
          email: true,
        },
      },
      order: {
        actualizadaEn: 'ASC',
      },
    });

    const rows = novedades.map((novedad) => ({
      filial_codigo: novedad.filial.codigo,
      documento_solicitante: novedad.solicitante.email,
      tipo_novedad: novedad.tipo,
      fecha_inicio: novedad.fechaInicio,
      fecha_fin: novedad.fechaFin ?? '',
      estado: novedad.estado,
      aprobado_por: novedad.aprobador?.email ?? '',
      // Se usa actualizadaEn como fecha_aprobacion porque no existe una columna dedicada.
      fecha_aprobacion: this.toIsoDate(novedad.actualizadaEn),
    }));

    const filePrefix = `novedades-aprobadas-${user.filialId}`;

    if (query.format === NovedadExportFormat.JSON) {
      return {
        fileName: `${filePrefix}.json`,
        contentType: 'application/json; charset=utf-8',
        content: JSON.stringify(rows, null, 2),
      };
    }

    const csvRows = rows.map((row) =>
      [
        row.filial_codigo,
        row.documento_solicitante,
        row.tipo_novedad,
        row.fecha_inicio,
        row.fecha_fin,
        row.estado,
        row.aprobado_por,
        row.fecha_aprobacion,
      ]
        .map((value) => this.escapeCsvValue(value))
        .join(';'),
    );

    const content = [this.EXPORT_HEADER, ...csvRows].join('\n');

    return {
      fileName: `${filePrefix}.csv`,
      contentType: 'text/csv; charset=utf-8',
      content,
    };
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
