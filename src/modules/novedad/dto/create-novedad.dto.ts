import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';
import { NovedadTipo } from '../enums/novedad-tipo.enum';
import { NovedadEstado } from '../enums/novedad-estado.enum';

export class CreateNovedadDto {
  @IsNotEmpty()
  @IsEnum(NovedadTipo)
  tipo!: NovedadTipo;

  @IsNotEmpty()
  @IsDateString()
  fechaInicio!: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  aprobadorId?: number;

  @IsNotEmpty()
  @IsIn([NovedadEstado.BORRADOR, NovedadEstado.PENDIENTE])
  estado!: NovedadEstado;
}
