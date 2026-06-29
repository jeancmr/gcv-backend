import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateFilialDto {
  @Transform(({ value }: { value: string }) => value.trim())
  @IsNotEmpty()
  @IsString()
  @Length(1, 120)
  nombre!: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 20)
  codigo!: string;
}
