import { IsOptional, IsEnum, IsDate, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { NovedadTipo } from '../enums/novedad-tipo.enum';
import { NovedadEstado } from '../enums/novedad-estado.enum';

export class GetNovedadesQueryDto {
  @IsOptional()
  @IsEnum(NovedadTipo)
  tipo?: NovedadTipo;

  @IsOptional()
  @IsEnum(NovedadEstado)
  estado?: NovedadEstado;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  desde?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  hasta?: Date;
}
