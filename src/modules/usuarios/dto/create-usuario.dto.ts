import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  MinLength,
} from 'class-validator';
import { UsuarioRol } from '../enums/usuario-rol.enum';
import { Transform } from 'class-transformer';

export class CreateUsuarioDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Transform(({ value }: { value: string }) => value.trim())
  @IsNotEmpty()
  @IsString()
  nombre!: string;

  @Transform(({ value }: { value: string }) => value.trim())
  @IsString()
  @MinLength(4)
  contrasena!: string;

  @IsNotEmpty()
  @IsEnum(UsuarioRol)
  rol!: UsuarioRol;

  @IsNotEmpty()
  @IsNumber()
  filialId!: number;

  @IsOptional()
  @IsEmail()
  supervisorEmail?: string;
}
