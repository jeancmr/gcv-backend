import { IsEnum, IsOptional } from 'class-validator';

export enum NovedadExportFormat {
  CSV = 'csv',
  JSON = 'json',
}

export class ExportNovedadesQueryDto {
  @IsOptional()
  @IsEnum(NovedadExportFormat)
  format: NovedadExportFormat = NovedadExportFormat.CSV;
}
