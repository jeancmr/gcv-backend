import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { AuditoriaAccion } from '../enums/auditoria-accion.enum';

export class CreateAuditoriaDto {
  @IsNotEmpty()
  @IsNumber()
  actorId!: number;

  @IsNotEmpty()
  @IsNumber()
  filialId!: number;

  @IsNotEmpty()
  @IsEnum(AuditoriaAccion)
  accion!: AuditoriaAccion;

  @IsNotEmpty()
  @IsString()
  entidad!: string;

  @IsOptional()
  @IsString()
  entidadId?: string;

  @IsOptional()
  detalle?: Record<string, unknown>;
}
