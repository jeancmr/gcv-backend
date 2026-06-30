import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { AuditoriaAccion } from '../enums/auditoria-accion.enum';

export class GetAuditoriaQueryDto {
  @IsOptional()
  @IsNumber()
  empleado?: number;

  @IsOptional()
  @IsEnum(AuditoriaAccion)
  accion?: AuditoriaAccion;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  desde?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  hasta?: Date;
}
